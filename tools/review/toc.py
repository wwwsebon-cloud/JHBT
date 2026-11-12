#!/usr/bin/env python3
# index.html 스크립트 맨 위 「목차」 다시 쓰기 (R2.36 코드 리뷰) — python tools/review/toc.py
#   `// ═════════ 제목 ═════════` 머리말을 순서대로 모아 `// ┌─ 목차` ~ `// └─` 사이에 적는다 (줄 번호는 금방 틀려서 적지 않는다 · 제목으로 검색)
#   새 큰 구간을 만들면 머리말을 달고 이 도구를 돌린다 · 섞인 줄바꿈은 그대로 둔다
import re
P = 'index.html'; s = open(P, encoding='utf-8', newline='').read()
TOP, END = '// ┌─ 목차', '// └─'
def short(t):
    t = t.strip('═ ').strip(); m = re.search(r' \(|: | — ', t); return (t[:m.start()] if m and m.start() >= 2 else t)[:60].strip()
heads = [short(m.group(1)) for m in re.finditer(r'(?m)^// ═════════ (.*?)\r?$', s)]
a = s.find('\n' + TOP)
if a >= 0: b = s.index('\n', s.index('\n' + END, a) + 1); nl = '\r\n' if s[b - 1] == '\r' else '\n'; a += 1; b += 1
else: a = b = s.index('\n// ═════════ ') + 1; e = s.index('\n', a); nl = '\r\n' if s[e - 1] == '\r' else '\n'
rows = [TOP + ' (python tools/review/toc.py 가 다시 쓴다 · 「═ 제목」 으로 검색) ─'] + ['// │ ' + '   ·   '.join(heads[i:i + 4]) for i in range(0, len(heads), 4)] + [END]
s = s[:a] + nl.join(rows) + nl + s[b:]
open(P, 'w', encoding='utf-8', newline='').write(s); print(f'목차 {len(heads)}개 구간')
