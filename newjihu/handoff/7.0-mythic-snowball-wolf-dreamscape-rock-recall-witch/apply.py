import base64, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from snippets import EDITS, MYTHIC_EDITS, MYTHIC_REPLACE_ALL, CSS, PORTRAIT_FILES
repo = sys.argv[1]
p = os.path.join(repo, 'index.html')
s = open(p, encoding='utf-8').read()
if 'function tickNew70b(' not in s: raise SystemExit('1차 인계(GT·가시·낚시·낫)를 먼저 적용하세요: newjihu/handoff/7.0-gt-thorn-fishing-scythe/apply.py')
if 'function tickNew70c(' in s: raise SystemExit('이미 적용됨')
def edit(anchor, where, code, title):
    global s
    n = s.count(anchor)
    if n != 1: raise SystemExit(f'anchor x{n}: {title}')
    s = s.replace(anchor, anchor + code if where == 'after' else code + anchor if where == 'before' else code)
pdir = os.path.join(repo, 'newjihu', '7.0newjihgu')
portraits = ''.join(f"  {k}: 'data:image/png;base64,{base64.b64encode(open(os.path.join(pdir, f), 'rb').read()).decode()}',\n" for k, f in PORTRAIT_FILES)
edit('const PORTRAITS = {\n', 'after', portraits, 'PORTRAITS')
for title, anchor, where, code in MYTHIC_EDITS + EDITS:
    edit(anchor, where, code, title)
for title, anchor, code, n in MYTHIC_REPLACE_ALL:
    if s.count(anchor) != n: raise SystemExit(f'anchor x{s.count(anchor)} (expected {n}): {title}')
    s = s.replace(anchor, code)
edit('/* ===== 7.0 신규: GT · 가시 · 낚시 · 낫 ===== */\n', 'before', CSS, 'CSS')
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(MYTHIC_EDITS) + len(EDITS) + len(MYTHIC_REPLACE_ALL) + 2, 'edits')
