export class RollingAudioBuffer {
  constructor(maxSeconds = 60) {
    this.maxSeconds = maxSeconds;
    this.sampleRate = 0;
    this.stream = null;
    this.context = null;
    this.source = null;
    this.capture = null;
    this.silentGain = null;
    this.chunks = [];
    this.totalSamples = 0;
    this.ownsStreamTracks = true;
    this.captureRequestId = 0;
  }

  get audioTrack() {
    return this.stream?.getAudioTracks()[0] ?? null;
  }

  get availableSeconds() {
    return this.sampleRate ? Math.min(this.maxSeconds, this.totalSamples / this.sampleRate) : 0;
  }

  async start() {
    await this.stop({ keepAudio: false });
    const requestId = ++this.captureRequestId;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    if (requestId !== this.captureRequestId) {
      for (const track of stream.getTracks()) track.stop();
      throw new DOMException("Microphone start was superseded.", "AbortError");
    }
    this.stream = stream;
    this.ownsStreamTracks = true;
    return this.startCapture(requestId);
  }

  async startFromTrack(track) {
    await this.stop({ keepAudio: false });
    if (!track || track.kind !== "audio") throw new Error("An audio track is required.");
    const requestId = ++this.captureRequestId;
    this.stream = new MediaStream([track]);
    this.ownsStreamTracks = false;
    return this.startCapture(requestId);
  }

  async startCapture(requestId = this.captureRequestId) {
    const track = this.audioTrack;
    if (track && "contentHint" in track) track.contentHint = "speech";

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContextClass({ latencyHint: "interactive" });
    this.sampleRate = this.context.sampleRate;
    await this.context.resume();
    if (requestId !== this.captureRequestId) throw new DOMException("Microphone start was superseded.", "AbortError");
    this.source = this.context.createMediaStreamSource(this.stream);
    this.silentGain = this.context.createGain();
    this.silentGain.gain.value = 0;

    if (this.context.audioWorklet && window.AudioWorkletNode) {
      await this.context.audioWorklet.addModule("./audio-worklet.js?v=26");
      if (requestId !== this.captureRequestId) throw new DOMException("Microphone start was superseded.", "AbortError");
      this.capture = new AudioWorkletNode(this.context, "rolling-audio-capture", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      this.capture.port.onmessage = (event) => this.push(event.data);
      this.source.connect(this.capture).connect(this.silentGain).connect(this.context.destination);
      return track;
    }

    const processor = this.context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      this.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      event.outputBuffer.getChannelData(0).fill(0);
    };
    this.capture = processor;
    this.source.connect(processor).connect(this.silentGain).connect(this.context.destination);
    return track;
  }

  push(samples) {
    if (!(samples instanceof Float32Array) || samples.length === 0) return;
    this.chunks.push(samples);
    this.totalSamples += samples.length;
    const maximum = Math.ceil(this.maxSeconds * this.sampleRate);
    while (this.totalSamples > maximum && this.chunks.length > 0) {
      const overflow = this.totalSamples - maximum;
      const first = this.chunks[0];
      if (first.length <= overflow) {
        this.chunks.shift();
        this.totalSamples -= first.length;
      } else {
        this.chunks[0] = first.slice(overflow);
        this.totalSamples -= overflow;
      }
    }
  }

  takeLast(seconds) {
    if (!this.sampleRate || this.totalSamples === 0) return new Float32Array();
    const wanted = Math.min(this.totalSamples, Math.floor(seconds * this.sampleRate));
    const output = new Float32Array(wanted);
    let writeOffset = wanted;
    for (let index = this.chunks.length - 1; index >= 0 && writeOffset > 0; index -= 1) {
      const chunk = this.chunks[index];
      const count = Math.min(writeOffset, chunk.length);
      writeOffset -= count;
      output.set(chunk.subarray(chunk.length - count), writeOffset);
    }
    return output;
  }

  createWav(seconds) {
    const samples = this.takeLast(seconds);
    if (samples.length === 0) return null;
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);
    for (let index = 0; index < samples.length; index += 1) {
      const clamped = Math.max(-1, Math.min(1, samples[index]));
      view.setInt16(44 + index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  async stop({ keepAudio = true } = {}) {
    this.captureRequestId += 1;
    if (this.capture) {
      try { this.capture.disconnect(); } catch {}
      if ("port" in this.capture) this.capture.port.onmessage = null;
      if ("onaudioprocess" in this.capture) this.capture.onaudioprocess = null;
    }
    try { this.source?.disconnect(); } catch {}
    try { this.silentGain?.disconnect(); } catch {}
    if (this.ownsStreamTracks) {
      for (const track of this.stream?.getTracks() ?? []) track.stop();
    }
    if (this.context && this.context.state !== "closed") await this.context.close().catch(() => {});
    this.stream = null;
    this.context = null;
    this.source = null;
    this.capture = null;
    this.silentGain = null;
    this.ownsStreamTracks = true;
    if (!keepAudio) {
      this.chunks = [];
      this.totalSamples = 0;
      this.sampleRate = 0;
    }
  }
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}
