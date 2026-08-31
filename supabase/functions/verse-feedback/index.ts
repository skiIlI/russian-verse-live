import {
  createFeedback,
  deleteFeedback,
  findByAccess,
  findByClientId,
  recentCount,
  updateFeedback,
  type FeedbackRow,
} from './database.ts';
import { createSignedR2Url, deleteAudio, uploadAudio } from './r2.ts';
import {
  RequestError,
  corsHeaders,
  jsonResponse,
  originAllowed,
  parseSubmission,
  requestOrigin,
  type FeedbackMetadata,
} from './validation.ts';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_MAX_REPORTS = 12;

async function submitterHash(req: Request): Promise<string> {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = req.headers.get('cf-connecting-ip') ?? forwarded ?? req.headers.get('x-real-ip') ?? 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${day}|${address}|verse-feedback`);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function reportInput(metadata: FeedbackMetadata, origin: string, hash: string, hasAudio: boolean) {
  return {
    actual_audio_seconds: metadata.actualAudioSeconds,
    app_version: metadata.appVersion,
    browser: metadata.browser,
    caught_text: metadata.caught,
    client_report_id: metadata.id,
    context: metadata.context,
    expected_text: metadata.expected,
    kind: metadata.kind,
    timing: metadata.timing,
    language: metadata.language,
    latest_reference: metadata.latestReference,
    note: metadata.note,
    requested_audio_seconds: metadata.requestedAudioSeconds,
    source_origin: origin,
    status: hasAudio ? 'uploading' : 'new',
    submitter_hash: hash,
    transcripts: metadata.transcripts,
  };
}

async function finishAudio(row: FeedbackRow, audio: File): Promise<FeedbackRow> {
  const objectPath = `verse-feedback/${new Date().toISOString().slice(0, 7)}/${row.id}.wav`;
  try {
    await uploadAudio(objectPath, audio);
    await updateFeedback(row.id, {
      audio_content_type: audio.type,
      audio_path: objectPath,
      audio_size_bytes: audio.size,
      error_message: null,
      status: 'new',
    });
    return { ...row, audio_path: objectPath, status: 'new' };
  } catch (error) {
    await updateFeedback(row.id, {
      error_message: error instanceof Error ? error.message.slice(0, 500) : 'Audio upload failed.',
      status: 'audio_failed',
    });
    throw new RequestError('Feedback text was saved, but audio upload will be retried.', 502);
  }
}

async function handlePost(req: Request, origin: string): Promise<Response> {
  if (!originAllowed(origin)) return jsonResponse(origin, { error: 'Origin not allowed.' }, 403);
  const { audio, metadata } = await parseSubmission(req);
  let row = await findByClientId(metadata.id);
  if (row && !['uploading', 'audio_failed'].includes(row.status)) {
    return jsonResponse(origin, { audioAttached: Boolean(row.audio_path), duplicate: true, ok: true, reportId: row.id });
  }

  if (!row) {
    const hash = await submitterHash(req);
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    if (await recentCount(hash, since) >= RATE_LIMIT_MAX_REPORTS) {
      return jsonResponse(origin, { error: 'Too many reports. Please try again in a few minutes.' }, 429);
    }
    row = await createFeedback(reportInput(metadata, origin, hash, Boolean(audio)));
  }

  if (audio) row = await finishAudio(row, audio);
  else if (row.status !== 'new') await updateFeedback(row.id, { error_message: null, status: 'new' });
  console.log('✅ [Verse Feedback] accepted', { audioBytes: audio?.size ?? 0, kind: metadata.kind, reportId: row.id });
  return jsonResponse(origin, { audioAttached: Boolean(row.audio_path), ok: true, reportId: row.id }, 201);
}

async function handleGet(req: Request, origin: string): Promise<Response> {
  const url = new URL(req.url);
  const row = await findByAccess(url.searchParams.get('id') ?? '', url.searchParams.get('token') ?? '');
  if (!row?.audio_path) return jsonResponse(origin, { error: 'Audio not found.' }, 404);
  return new Response(null, {
    headers: { ...corsHeaders(origin), Location: await createSignedR2Url('GET', row.audio_path) },
    status: 302,
  });
}

async function handleDelete(req: Request, origin: string): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const row = await findByAccess(url.searchParams.get('id') ?? '', token);
  if (!row) return jsonResponse(origin, { error: 'Feedback not found.' }, 404);
  if (row.audio_path) await deleteAudio(row.audio_path);
  await deleteFeedback(row.id, token);
  return jsonResponse(origin, { deleted: true, ok: true });
}

Deno.serve(async (req) => {
  const origin = requestOrigin(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin), status: 204 });
  try {
    if (req.method === 'POST') return await handlePost(req, origin);
    if (req.method === 'GET') return await handleGet(req, origin);
    if (req.method === 'DELETE') return await handleDelete(req, origin);
    return jsonResponse(origin, { error: 'Method not allowed.' }, 405);
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 500;
    if (status >= 500) console.error('❌ [Verse Feedback] failed', error);
    return jsonResponse(origin, {
      error: error instanceof RequestError ? error.message : 'Feedback could not be submitted.',
    }, status);
  }
});
