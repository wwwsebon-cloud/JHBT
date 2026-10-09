import base64, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from snippets import EDITS, CSS, PORTRAIT_FILES
repo = sys.argv[1]
p = os.path.join(repo, 'index.html')
s = open(p, encoding='utf-8').read()
def edit(anchor, where, code, title):
    global s
    n = s.count(anchor)
    if n != 1: raise SystemExit(f'anchor x{n}: {title}')
    s = s.replace(anchor, anchor + code if where == 'after' else code + anchor if where == 'before' else code)
pdir = os.path.join(repo, 'newjihu', '7.0newjihgu')
portraits = ''.join(f"  {k}: 'data:image/png;base64,{base64.b64encode(open(os.path.join(pdir, f), 'rb').read()).decode()}',\n" for k, f in PORTRAIT_FILES)
edit('const PORTRAITS = {\n', 'after', portraits, 'PORTRAITS')
for title, anchor, where, code in EDITS:
    edit(anchor, where, code, title)
edit('.unit .unit-hpbar-wrap {\n', 'before', CSS, 'CSS')
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(EDITS) + 2, 'edits')
