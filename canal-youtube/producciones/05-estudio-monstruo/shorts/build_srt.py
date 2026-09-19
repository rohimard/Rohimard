import json, textwrap

segments = json.load(open('segments.json', encoding='utf-8'))

def srt_time(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

lines = []
for i, seg in enumerate(segments, 1):
    text = seg["text"]
    wrapped = textwrap.wrap(text, width=28, break_long_words=False)
    if len(wrapped) > 2:
        mid = len(text) // 2
        left = text.rfind(' ', 0, mid)
        wrapped = [text[:left], text[left+1:]] if left != -1 else [text]
    block_text = "\n".join(wrapped)
    lines.append(f"{i}\n{srt_time(seg['t_start'])} --> {srt_time(seg['t_end'])}\n{block_text}\n")

open('subtitulos.srt', 'w', encoding='utf-8').write("\n".join(lines))
print("wrote subtitulos.srt —", len(segments), "cues")
