export function inputLevelFromSamples(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) sum += samples[index] ** 2;
  const rms = Math.sqrt(sum / samples.length);
  if (rms <= 0.00001) return 0;
  return Math.max(0, Math.min(1, (20 * Math.log10(rms) + 60) / 60));
}

export function createMicLevelMeter(options) {
  const scope = globalThis.window ?? globalThis;
  const meter = options.meterElement;
  const label = options.labelElement;
  const AudioContextClass = options.AudioContextClass ?? scope.AudioContext ?? scope.webkitAudioContext;
  const requestFrame = options.requestFrame ?? scope.requestAnimationFrame?.bind(scope);
  const cancelFrame = options.cancelFrame ?? scope.cancelAnimationFrame?.bind(scope);
  const documentObject = options.documentObject ?? scope.document;
  const bars = [...meter.children];
  let context = null;
  let source = null;
  let analyser = null;
  let silentGain = null;
  let samples = null;
  let frameId = null;
  let running = false;
  let smoothedLevel = 0;

  function render(level) {
    const percent = Math.round(level * 100);
    const activeCount = percent === 0 ? 0 : Math.max(1, Math.round(level * bars.length));
    bars.forEach((bar, index) => bar.classList.toggle("active", index < activeCount));
    meter.setAttribute("aria-valuenow", String(percent));
    meter.setAttribute("aria-valuetext", `${percent}% input level`);
    label.textContent = `${percent}%`;
  }

  function cancelDraw() {
    if (frameId !== null && cancelFrame) cancelFrame(frameId);
    frameId = null;
  }

  function draw() {
    frameId = null;
    if (!running || documentObject?.hidden || !analyser || !requestFrame) return;
    analyser.getFloatTimeDomainData(samples);
    const next = inputLevelFromSamples(samples);
    smoothedLevel = next >= smoothedLevel ? next : smoothedLevel * 0.86;
    if (smoothedLevel < 0.005) smoothedLevel = 0;
    render(smoothedLevel);
    frameId = requestFrame(draw);
  }

  function resumeDrawing() {
    if (running && !documentObject?.hidden && frameId === null && requestFrame) frameId = requestFrame(draw);
  }

  function handleVisibility() {
    if (documentObject?.hidden) cancelDraw();
    else resumeDrawing();
  }

  async function stop() {
    running = false;
    cancelDraw();
    documentObject?.removeEventListener?.("visibilitychange", handleVisibility);
    try { source?.disconnect(); } catch {}
    try { analyser?.disconnect(); } catch {}
    try { silentGain?.disconnect(); } catch {}
    if (context && context.state !== "closed") await context.close().catch(() => {});
    context = null;
    source = null;
    analyser = null;
    silentGain = null;
    samples = null;
    smoothedLevel = 0;
    render(0);
  }

  async function start(stream) {
    await stop();
    if (!AudioContextClass || !requestFrame) return false;
    context = new AudioContextClass({ latencyHint: "interactive" });
    source = context.createMediaStreamSource(stream);
    analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    silentGain = context.createGain();
    silentGain.gain.value = 0;
    source.connect(analyser);
    analyser.connect(silentGain);
    silentGain.connect(context.destination);
    samples = new Float32Array(analyser.fftSize);
    running = true;
    documentObject?.addEventListener?.("visibilitychange", handleVisibility);
    await context.resume().catch(() => {});
    resumeDrawing();
    return true;
  }

  render(0);
  return { start, stop, pause: cancelDraw, resume: resumeDrawing };
}
