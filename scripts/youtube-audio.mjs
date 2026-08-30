const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function score(format) {
  const mime = String(format.mimeType ?? "");
  const codec = /mp4a/i.test(mime) ? 2 : /opus/i.test(mime) ? 1 : 0;
  return codec * 1_000_000 + Number(format.bitrate ?? 0);
}

export function chooseAudioFormat(formats = []) {
  return formats
    .filter((format) => format.url && String(format.mimeType).startsWith("audio/"))
    .sort((left, right) => score(right) - score(left))[0] ?? null;
}

export async function resolveYouTubeAudio(videoId, request = fetch) {
  if (!VIDEO_ID.test(videoId)) throw new Error("Enter a valid YouTube video link.");
  const watch = await request(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "Accept-Language": "en-US,en;q=0.8",
      "User-Agent": "Mozilla/5.0 VerseDetector/1.0",
    },
  });
  if (!watch.ok) throw new Error(`YouTube returned ${watch.status}.`);
  const html = await watch.text();
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  if (!apiKey) throw new Error("YouTube audio metadata was unavailable.");
  const player = await request(`https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoId,
      contentCheckOk: true,
      racyCheckOk: true,
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: "20.10.38",
          androidSdkVersion: 34,
          hl: "en",
        },
      },
    }),
  });
  if (!player.ok) throw new Error(`YouTube player returned ${player.status}.`);
  const document = await player.json();
  const status = document?.playabilityStatus?.status;
  if (status && status !== "OK") throw new Error(document.playabilityStatus.reason || "This video cannot be played.");
  const format = chooseAudioFormat(document?.streamingData?.adaptiveFormats);
  if (!format) throw new Error("No directly playable YouTube audio track was available.");
  return {
    url: format.url,
    mimeType: String(format.mimeType),
    contentLength: Number(format.contentLength ?? 0),
    title: document?.videoDetails?.title ?? "YouTube service",
  };
}
