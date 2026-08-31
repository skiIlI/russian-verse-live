import type { FeedbackMetadata } from './validation.ts';

export type FeedbackRow = {
  id: string;
  client_report_id: string;
  status: string;
  audio_path: string | null;
  audio_access_token: string;
};

type NewFeedbackRow = {
  client_report_id: string;
  status: string;
  language: string;
  kind: string;
  timing: string;
  expected_text: string;
  caught_text: string;
  note: string;
  requested_audio_seconds: number;
  actual_audio_seconds: number;
  context: Record<string, unknown>;
  latest_reference: Record<string, unknown> | null;
  transcripts: FeedbackMetadata['transcripts'];
  app_version: string;
  browser: string;
  source_origin: string;
  submitter_hash: string;
};

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing Edge Function environment: ${name}`);
  return value;
}

function secretKey(): string {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys) as Record<string, string>;
    if (parsed.default) return parsed.default;
  }
  return requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
}

async function databaseRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const key = secretKey();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Content-Type', 'application/json');
  if (!key.startsWith('sb_secret_')) headers.set('Authorization', `Bearer ${key}`);
  return fetch(`${requiredEnv('SUPABASE_URL')}/rest/v1/${path}`, { ...init, headers });
}

async function rows<T>(response: Response): Promise<T[]> {
  if (!response.ok) throw new Error(`Feedback database request failed (${response.status}).`);
  return await response.json() as T[];
}

export async function findByClientId(clientReportId: string): Promise<FeedbackRow | null> {
  const query = new URLSearchParams({
    client_report_id: `eq.${clientReportId}`,
    limit: '1',
    select: 'id,client_report_id,status,audio_path,audio_access_token',
  });
  return (await rows<FeedbackRow>(await databaseRequest(`verse_feedback_reports?${query}`)))[0] ?? null;
}

export async function findByAccess(id: string, token: string): Promise<FeedbackRow | null> {
  const query = new URLSearchParams({
    audio_access_token: `eq.${token}`,
    id: `eq.${id}`,
    limit: '1',
    select: 'id,client_report_id,status,audio_path,audio_access_token',
  });
  return (await rows<FeedbackRow>(await databaseRequest(`verse_feedback_reports?${query}`)))[0] ?? null;
}

export async function recentCount(submitterHash: string, since: string): Promise<number> {
  const query = new URLSearchParams({
    created_at: `gte.${since}`,
    limit: '13',
    select: 'id',
    submitter_hash: `eq.${submitterHash}`,
  });
  return (await rows<{ id: string }>(await databaseRequest(`verse_feedback_reports?${query}`))).length;
}

export async function createFeedback(input: NewFeedbackRow): Promise<FeedbackRow> {
  const response = await databaseRequest('verse_feedback_reports?select=id,client_report_id,status,audio_path,audio_access_token', {
    body: JSON.stringify(input),
    headers: { Prefer: 'return=representation' },
    method: 'POST',
  });
  const row = (await rows<FeedbackRow>(response))[0];
  if (!row) throw new Error('Feedback database insert returned no row.');
  return row;
}

export async function updateFeedback(id: string, changes: Record<string, unknown>): Promise<void> {
  const response = await databaseRequest(`verse_feedback_reports?id=eq.${encodeURIComponent(id)}`, {
    body: JSON.stringify({ ...changes, updated_at: new Date().toISOString() }),
    method: 'PATCH',
  });
  if (!response.ok) throw new Error(`Feedback database update failed (${response.status}).`);
}

export async function deleteFeedback(id: string, token: string): Promise<void> {
  const query = new URLSearchParams({ audio_access_token: `eq.${token}`, id: `eq.${id}` });
  const response = await databaseRequest(`verse_feedback_reports?${query}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Feedback database delete failed (${response.status}).`);
}
