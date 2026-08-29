class RollingAudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pending = [];
    this.pendingLength = 0;
  }

  process(inputs, outputs) {
    const channels = inputs[0];
    const output = outputs[0]?.[0];
    if (output) output.fill(0);
    if (!channels?.length || !channels[0]?.length) return true;

    const mono = new Float32Array(channels[0].length);
    for (let channelIndex = 0; channelIndex < channels.length; channelIndex += 1) {
      const channel = channels[channelIndex];
      for (let index = 0; index < channel.length; index += 1) mono[index] += channel[index] / channels.length;
    }
    this.pending.push(mono);
    this.pendingLength += mono.length;

    if (this.pendingLength >= 4096) {
      const combined = new Float32Array(this.pendingLength);
      let offset = 0;
      for (const chunk of this.pending) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      this.pending = [];
      this.pendingLength = 0;
      this.port.postMessage(combined, [combined.buffer]);
    }
    return true;
  }
}

registerProcessor("rolling-audio-capture", RollingAudioCaptureProcessor);
