export const SERVICE_VIDEO_ID = "Y5bbaQmyXKI";
export const SERVICE_VIDEO_URL = `https://www.youtube.com/watch?v=${SERVICE_VIDEO_ID}`;

export function parseYouTubeVideoId(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return /^[\w-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : null;
    if (!["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) return null;
    const pathId = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    const videoId = pathId ?? url.searchParams.get("v");
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return /^[\w-]{11}$/.test(value.trim()) ? value.trim() : null;
  }
}

export function parseTimestamp(value) {
  if (typeof value !== "string" || !/^\d{1,2}(?::\d{2}){1,2}$/.test(value.trim())) return null;
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;
  if (parts.at(-1) >= 60 || (parts.length === 3 && parts[1] >= 60)) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

export function configureYouTubeReview({ container, content, frame, link, status }) {
  let loaded = false;
  let pendingSeconds = null;
  let videoId = SERVICE_VIDEO_ID;
  let currentSeconds = 0;

  function postCommand(func, args = []) {
    frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "https://www.youtube-nocookie.com");
  }

  function sendSeek(seconds) {
    postCommand("seekTo", [seconds, true]);
    postCommand("playVideo");
  }

  function setVideo(value) {
    const nextVideoId = parseYouTubeVideoId(value) ?? SERVICE_VIDEO_ID;
    if (nextVideoId === videoId && frame.src) return videoId;
    videoId = nextVideoId;
    loaded = false;
    pendingSeconds = null;
    const origin = location.protocol === "http:" || location.protocol === "https:"
      ? `&origin=${encodeURIComponent(location.origin)}`
      : "";
    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0${origin}`;
    link.href = `https://www.youtube.com/watch?v=${videoId}`;
    return videoId;
  }

  function show(value = videoId) {
    container.hidden = false;
    content.classList.add("video-active");
    setVideo(value);
  }

  function setExpanded(expanded) {
    document.body.classList.toggle("video-review-active", expanded && !container.hidden);
  }

  function seek(timestamp) {
    const seconds = parseTimestamp(timestamp);
    if (seconds === null) return false;
    show();
    setExpanded(true);
    pendingSeconds = seconds;
    status.textContent = `${timestamp} · seeking and playing in the service video`;
    if (loaded) sendSeek(seconds);
    return true;
  }

  frame.addEventListener("load", () => {
    loaded = true;
    frame.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "verse-listener" }), "https://www.youtube-nocookie.com");
    if (pendingSeconds !== null) sendSeek(pendingSeconds);
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== "https://www.youtube-nocookie.com") return;
    try {
      const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data?.event === "infoDelivery" && Number.isFinite(data.info?.currentTime)) currentSeconds = data.info.currentTime;
    } catch {}
  });

  return { getCurrentTime: () => currentSeconds || pendingSeconds || 0, seek, setExpanded, setVideo, show };
}
