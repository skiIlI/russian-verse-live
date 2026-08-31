import argparse
import json
import time

from faster_whisper import WhisperModel


def clock(seconds):
    value = max(0, int(seconds))
    hours = value // 3600
    minutes = (value % 3600) // 60
    remainder = value % 60
    return f"{hours}:{minutes:02d}:{remainder:02d}" if hours else f"{minutes}:{remainder:02d}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("audio")
    parser.add_argument("output")
    parser.add_argument("--start", type=float, default=1200)
    parser.add_argument("--duration", type=float, default=600)
    parser.add_argument("--language", default="ru")
    parser.add_argument("--models", nargs="+", default=["base", "small", "medium", "large-v3-turbo"])
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    args = parser.parse_args()
    device = args.device
    compute_type = "float16" if device == "cuda" else "int8"
    report = {"start": args.start, "duration": args.duration, "device": device, "computeType": compute_type, "results": []}
    for name in args.models:
        started = time.perf_counter()
        model = WhisperModel(name, device=device, compute_type=compute_type)
        segments, info = model.transcribe(
            args.audio,
            language=args.language,
            clip_timestamps=[args.start, args.start + args.duration],
            vad_filter=True,
            beam_size=5,
            condition_on_previous_text=True,
        )
        rows = []
        text = []
        for segment in segments:
            clean = segment.text.strip()
            if clean:
                rows.append(f"{clock(segment.start)} {clean}")
                text.append(clean)
        report["results"].append({
            "model": name,
            "runtimeSeconds": round(time.perf_counter() - started, 3),
            "languageProbability": info.language_probability,
            "text": " ".join(text),
            "timestamped": "\n".join(rows),
        })
        with open(args.output, "w", encoding="utf-8") as target:
            json.dump(report, target, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
