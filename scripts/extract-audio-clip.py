import sys
import wave

import av


def main():
    source, destination, start_text, duration_text = sys.argv[1:5]
    start = max(0.0, float(start_text))
    end = start + max(1.0, float(duration_text))
    container = av.open(source)
    audio_stream = next(stream for stream in container.streams if stream.type == "audio")
    container.seek(int(start * av.time_base), backward=True)
    resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=16000)
    pcm = bytearray()
    for frame in container.decode(audio_stream):
        frame_time = float(frame.time or 0)
        frame_end = frame_time + float(frame.duration * frame.time_base)
        if frame_end < start:
            continue
        if frame_time >= end:
            break
        for output in resampler.resample(frame):
            pcm.extend(output.to_ndarray().tobytes())
    with wave.open(destination, "wb") as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(16000)
        target.writeframes(pcm[: int(float(duration_text) * 16000 * 2)])


if __name__ == "__main__":
    main()
