const SIGNED_URL_TTL_SECONDS = 15 * 60;

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing R2 environment: ${name}`);
  return value;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
}

async function signingKey(secret: string, dateStamp: string): Promise<ArrayBuffer> {
  const date = await hmacSha256(new TextEncoder().encode(`AWS4${secret}`), dateStamp);
  const region = await hmacSha256(date, 'auto');
  const service = await hmacSha256(region, 's3');
  return hmacSha256(service, 'aws4_request');
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/gu, (character) => (
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  ));
}

function canonicalQuery(params: URLSearchParams): string {
  return [...params.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => (
      leftKey === rightKey ? leftValue.localeCompare(rightValue) : leftKey.localeCompare(rightKey)
    ))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join('&');
}

function encodedPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function createSignedR2Url(
  method: 'GET' | 'PUT' | 'DELETE',
  objectPath: string,
  contentType?: string,
): Promise<string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/gu, '');
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const endpoint = requiredEnv('R2_ENDPOINT').replace(/\/$/u, '');
  const bucket = requiredEnv('R2_BUCKET_NAME');
  const url = new URL(`${endpoint}/${bucket}/${encodedPath(objectPath)}`);
  const signedHeaders = method === 'PUT' ? 'content-type;host' : 'host';
  const headers = method === 'PUT'
    ? `content-type:${contentType}\nhost:${url.host}\n`
    : `host:${url.host}\n`;
  const params = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${requiredEnv('R2_ACCESS_KEY_ID')}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(SIGNED_URL_TTL_SECONDS),
    'X-Amz-SignedHeaders': signedHeaders,
  });
  const canonicalRequest = [
    method,
    url.pathname,
    canonicalQuery(params),
    headers,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(canonicalRequest)].join('\n');
  const key = await signingKey(requiredEnv('R2_SECRET_ACCESS_KEY'), dateStamp);
  params.set('X-Amz-Signature', toHex(await hmacSha256(key, stringToSign)));
  url.search = canonicalQuery(params);
  return url.toString();
}

export async function uploadAudio(objectPath: string, audio: File): Promise<void> {
  const response = await fetch(await createSignedR2Url('PUT', objectPath, audio.type), {
    body: audio,
    headers: { 'Content-Type': audio.type },
    method: 'PUT',
  });
  if (!response.ok) throw new Error(`R2 audio upload failed (${response.status}).`);
}

export async function deleteAudio(objectPath: string): Promise<void> {
  const response = await fetch(await createSignedR2Url('DELETE', objectPath), { method: 'DELETE' });
  if (!response.ok && response.status !== 404) throw new Error(`R2 audio delete failed (${response.status}).`);
}

