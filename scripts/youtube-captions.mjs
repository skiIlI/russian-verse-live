const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function extractJsonArray(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf("[", markerIndex + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === "[") depth += 1;
    else if (character === "]" && --depth === 0) return source.slice(start, index + 1);
  }
  return null;
}

export function parseCaptionTracks(watchHtml) {
  const raw = extractJsonArray(watchHtml, '"captionTracks":');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function clock(milliseconds) {
  const seconds = Math.max(0, Math.floor(Number(milliseconds) / 1_000));
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function captionEventsToTranscript(document) {
  return (document?.events ?? []).flatMap((event) => {
    const text = (event.segs ?? []).map((segment) => segment.utf8 ?? "").join("").replace(/\s+/g, " ").trim();
    return text ? [`${clock(event.tStartMs)} ${text}`] : [];
  }).join("\n");
}

function trackName(track) {
  return track.name?.simpleText
    ?? track.name?.runs?.map((run) => run.text ?? "").join("")
    ?? track.languageCode;
}

export async function extractYouTubeTranscript(videoId, language = "ru", request = fetch) {
  if (!VIDEO_ID.test(videoId)) throw new Error("Enter a valid YouTube video link.");
  const watch = await request(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "Accept-Language": "en-US,en;q=0.8",
      "User-Agent": "Mozilla/5.0 VerseDetector/1.0",
    },
  });
  if (!watch.ok) throw new Error(`YouTube returned ${watch.status}.`);
  const watchHtml = await watch.text();
  let tracks = parseCaptionTracks(watchHtml);
  const apiKey = watchHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  if (apiKey) {
    try {
      const player = await request(`https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          contentCheckOk: true,
          racyCheckOk: true,
          context: { client: { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 34, hl: "en" } },
        }),
      });
      const document = player.ok ? await player.json() : null;
      const innerTubeTracks = document?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      if (innerTubeTracks.length) tracks = innerTubeTracks;
    } catch {
      // The watch-page track remains a useful fallback when InnerTube is unavailable.
    }
  }
  if (!tracks.length) throw new Error("This video has no accessible caption track.");
  const prefix = language === "en" ? "en" : "ru";
  const candidates = tracks.filter((track) => String(track.languageCode).toLowerCase().startsWith(prefix));
  const track = [...(candidates.length ? candidates : tracks)].sort((left, right) => (
    Number(left.kind === "asr") - Number(right.kind === "asr")
  ))[0];
  const captionUrl = new URL(track.baseUrl);
  captionUrl.searchParams.set("fmt", "json3");
  const captions = await request(captionUrl);
  if (!captions.ok) throw new Error(`Caption download returned ${captions.status}.`);
  const transcript = captionEventsToTranscript(await captions.json());
  if (!transcript) throw new Error("The caption track was empty.");
  return {
    language: track.languageCode,
    name: trackName(track),
    transcript,
    videoId,
  };
}
