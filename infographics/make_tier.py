"""티어리스트 인포그래픽 생성기.

사용법:  python3 infographics/make_tier.py 7.7.6
결과:    infographics/tier-7.7.6.html  (헤드리스 크롬으로 PNG 캡처)

- index.html 의 TIER_HISTORY[버전] 표를 그린다. 직전 표와 비교해 ▲▼ 표시.
- 지후 이름은 CHAR_DB, 초상화는 PORTRAITS 에서 꺼낸다 (make.py 와 같다).
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make import portraits, ROOT  # noqa: E402

INFO = {'1': ('필수', '#e03131'), '2': ('추천', '#f76707'), '3': ('무난', '#e8a800'),
        '4': ('상황', '#2f9e44'), '5': ('비추', '#3b82c4'), '6': ('쓰레기', '#6b7280')}


def main():
    ver = sys.argv[1]
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    i = src.index('const TIER_HISTORY = ') + len('const TIER_HISTORY = ')
    hist = json.loads(src[i:src.index('\n', i)].rstrip(';'))
    keys = list(hist)
    cur = hist[ver]
    prev = hist[keys[keys.index(ver) + 1]] if keys.index(ver) + 1 < len(keys) else None
    old = {}
    if prev:
        for t, ids in prev['tiers'].items():
            for x in ids:
                old[x] = int(t) if t.isdigit() else 0
    names = dict(re.findall(r"^    id: '([a-z0-9_]+)', name: '([^']+)'", src, re.M))
    ids = [x for t in cur['tiers'].values() for x in t]
    pkey = {}
    for m in re.finditer(r"^    id: '([a-z0-9_]+)', name: '[^']+'.*?portrait: PORTRAITS\.(\w+)", src, re.M | re.S):
        if m.group(1) in ids and m.group(1) not in pkey and m.end() - m.start() < 600:
            pkey[m.group(1)] = m.group(2)
    raw = portraits(list(set(ids) | set(pkey.values())))
    pics = {x: raw[pkey.get(x, x)] for x in ids if pkey.get(x, x) in raw}
    rows = []
    for t in '123456':
        label, color = INFO[t]
        cells = []
        for x in cur['tiers'].get(t, []):
            o = old.get(x, 0)
            d = int(t) - o if o else 0
            arrow = '' if not d else (f'<i class="up">{"▲" * min(2, -d)}</i>' if d < 0 else f'<i class="dn">{"▼" * min(2, d)}</i>')
            new = '' if x in old or not prev else '<i class="nw">NEW</i>'
            pic = f'<img src="{pics[x]}" alt="">' if x in pics else '<span class="ph">?</span>'
            nm = names.get(x, x).replace(' 지후', '')
            cells.append(f'<div class="c">{arrow}{new}<div class="p">{pic}</div><b>{html.escape(nm)}</b></div>')
        rows.append(f'<section style="--tc:{color}"><h2><span>{t}</span><small>{label}</small></h2><div class="g">{"".join(cells)}</div></section>')
    note = html.escape(cur.get('note', ''))
    page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=1080">
<title>JHBT 티어리스트 {ver}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
* {{ box-sizing:border-box; margin:0; }}
body {{ background:#f3f1ec; font-family:'Pretendard Variable', Pretendard, system-ui, sans-serif; color:#1b1b1f; }}
#sheet {{ width:1080px; padding:56px 52px 48px; }}
header {{ display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:10px; }}
header h1 {{ font-size:58px; font-weight:900; letter-spacing:-.02em; }}
header h1 em {{ font-style:normal; color:#7a5cff; }}
header .v {{ font-size:22px; font-weight:800; background:#1b1b1f; color:#fff; padding:8px 18px; border-radius:999px; }}
.sub {{ font-size:19px; color:#666; margin-bottom:28px; line-height:1.5; }}
.sub b {{ color:#e03131; }} .sub b.d {{ color:#2f6fed; }}
section {{ display:flex; background:#fff; border-radius:22px; margin-bottom:16px; overflow:hidden; box-shadow:0 2px 0 rgba(0,0,0,.05); }}
section h2 {{ flex:none; width:118px; background:var(--tc); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }}
section h2 span {{ font-size:52px; font-weight:900; line-height:1; }}
section h2 small {{ font-size:20px; font-weight:800; opacity:.95; }}
.g {{ flex:1; display:grid; grid-template-columns:repeat(7, 1fr); gap:10px 6px; padding:16px 14px; }}
.c {{ position:relative; text-align:center; }}
.p {{ width:86px; height:86px; margin:0 auto 5px; border-radius:18px; background:#f6f5f2; border:2px solid #ececea; overflow:hidden; display:flex; align-items:center; justify-content:center; }}
.p img {{ width:100%; height:100%; object-fit:cover; }}
.ph {{ font-size:36px; font-weight:900; color:#aaa; }}
.c b {{ display:block; font-size:16px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
.c i {{ position:absolute; top:-4px; right:8px; font-style:normal; font-size:15px; font-weight:900; z-index:2; text-shadow:0 0 3px #fff, 0 0 3px #fff; }}
.c i.up {{ color:#e03131; }} .c i.dn {{ color:#2f6fed; }}
.c i.nw {{ background:#9b59d0; color:#fff; font-size:11px; padding:2px 6px; border-radius:99px; text-shadow:none; }}
footer {{ text-align:center; font-size:16px; color:#999; margin-top:22px; }}
</style></head><body><div id="sheet">
<header><h1>지후배틀 <em>티어리스트</em></h1><span class="v">v{ver}</span></header>
<div class="sub">{html.escape(cur.get('date', ''))} · {note}<br><b>▲</b> v{keys[keys.index(ver) + 1] if prev else ''}보다 상승 · <b class="d">▼</b> 하락 · 2티어 이상 움직이면 두 개 · 같은 티어 안에서는 왼쪽일수록 셉니다</div>
{''.join(rows)}
<footer>jihoobattle.kr</footer>
</div></body></html>"""
    out = os.path.join(ROOT, 'infographics', f'tier-{ver}.html')
    open(out, 'w', encoding='utf-8').write(page)
    print(out)


if __name__ == '__main__':
    main()
