"""sw.js 의 CORE (오프라인용으로 설치할 때 미리 받는 파일) 목록을 다시 만든다 (R2.24 build 4).
사용법: python tools/sw_assets.py   — 아이콘 · 효과 아이콘 · 효과음 · 만화 · 이모티콘 썸네일 (배경음악 · 큰 이모티콘은 쓸 때 받는다)
목록이 바뀌면 sw.js 의 CACHE 이름 끝 숫자를 하나 올려서 예전 사본을 지우게 한다.
"""
import os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIRS = ['icons', 'icons/fx', 'sfx', 'comic', 'emo/thumb']
EXT = ('.png', '.jpg', '.webp', '.gif', '.mp3', '.svg')

files = []
for d in DIRS:
    p = os.path.join(ROOT, d)
    for f in sorted(os.listdir(p)):
        if f.lower().endswith(EXT) and os.path.isfile(os.path.join(p, f)):
            files.append(d + '/' + f)
size = sum(os.path.getsize(os.path.join(ROOT, f)) for f in files)

sw = os.path.join(ROOT, 'sw.js')
s = open(sw, encoding='utf-8', newline='').read()
body = 'const CORE = [\n' + ''.join(f"  '{f}',\n" for f in files) + '];'
s2 = re.sub(r'const CORE = \[[^\]]*\];', lambda m: body, s, count=1)
assert s2 != s or body in s, 'CORE 를 못 찾았다'
open(sw, 'w', encoding='utf-8', newline='').write(s2)
print(f'CORE {len(files)}개 · {size / 1024 / 1024:.1f}MB')
