export type FeedbackMetadata = {
  id: string;
  appVersion: string;
  language: 'ru' | 'en';
  kind: 'missed' | 'wrong' | 'other';
  expected: string;
  caught: string;
  note: string;
  requestedAudioSeconds: number;
  actualAudioSeconds: number;
  context: Record<string, unknown>;
  latestReference: Record<string, unknown> | null;
  transcripts: Array<{ text: string; at?: string; interim?: boolean }>;
  browser: string;
};

export type Submission = { metadata: FeedbackMetadata; audio: File | null };

const MAX_REQUEST_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PROD_ORIGIN = 'https://skiili.github.io';

export class RequestError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function text(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function numberInRange(value: unknown, minimum: number, maximum: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(maximum, Math.max(minimum, numeric)) : minimum;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function transcripts(value: unknown): FeedbackMetadata['transcripts'] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((entry) => {
    const row = object(entry);
    const transcriptText = text(row.text, 2_000);
    if (!transcriptText) return [];
    return [{
      text: transcriptText,
      at: text(row.at, 40) || undefined,
      interim: row.interim === true || undefined,
    }];
  });
}

function normalizeMetadata(value: unknown): FeedbackMetadata {
  const row = object(value);
  const id = text(row.id, 36);
  const language = row.language === 'en' ? 'en' : row.language === 'ru' ? 'ru' : null;
  const kind = ['missed', 'wrong', 'other'].includes(String(row.kind))
    ? row.kind as FeedbackMetadata['kind']
    : null;
  if (!UUID_PATTERN.test(id)) throw new RequestError('Invalid report id.');
  if (!language || !kind) throw new RequestError('Invalid language or feedback type.');

  return {
    id,
    appVersion: text(row.appVersion, 40),
    language,
    kind,
    expected: text(row.expected, 500),
    caught: text(row.caught, 200),
    note: text(row.note, 2_000),
    requestedAudioSeconds: numberInRange(row.requestedAudioSeconds, 0, 60),
    actualAudioSeconds: numberInRange(row.actualAudioSeconds, 0, 60),
    context: object(row.context),
    latestReference: row.latestReference ? object(row.latestReference) : null,
    transcripts: transcripts(row.transcripts),
    browser: text(row.browser, 1_000),
  };
}

export function requestOrigin(req: Request): string {
  return req.headers.get('Origin')?.trim() ?? '';
}

export function originAllowed(origin: string): boolean {
  return origin === PROD_ORIGIN || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/u.test(origin);
}

export function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': originAllowed(origin) ? origin : PROD_ORIGIN,
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function jsonResponse(origin: string, body: unknown, status = 200): Response {
  return Response.json(body, { headers: corsHeaders(origin), status });
}

export async function parseSubmission(req: Request): Promise<Submission> {
  const declaredSize = Number(req.headers.get('Content-Length') ?? 0);
  if (declaredSize > MAX_REQUEST_BYTES) throw new RequestError('Feedback is too large.', 413);
  if (!req.headers.get('Content-Type')?.toLowerCase().includes('multipart/form-data')) {
    throw new RequestError('Expected multipart feedback.');
  }

  const form = await req.formData();
  const rawMetadata = form.get('metadata');
  if (typeof rawMetadata !== 'string') throw new RequestError('Missing feedback metadata.');
  let parsed: unknown;
  try { parsed = JSON.parse(rawMetadata); } catch { throw new RequestError('Invalid feedback metadata.'); }

  const audioEntry = form.get('audio');
  const audio = audioEntry instanceof File && audioEntry.size > 0 ? audioEntry : null;
  if (audio && audio.size > MAX_AUDIO_BYTES) throw new RequestError('Audio must be 8 MB or smaller.', 413);
  if (audio && !['audio/wav', 'audio/x-wav'].includes(audio.type)) {
    throw new RequestError('Only WAV feedback audio is accepted.');
  }
  return { audio, metadata: normalizeMetadata(parsed) };
}

