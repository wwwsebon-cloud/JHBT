"""업데이트 인포그래픽 생성기.

사용법:  python3 infographics/make.py infographics/4.6.4.json
결과:    infographics/4.6.4.html  (브라우저로 열어 캡처하거나 그대로 공유)

- 지후 초상화는 ../index.html 의 PORTRAITS 에서 id 로 꺼내 HTML 안에 넣는다 (파일 하나로 완결).
- 폰트는 Pretendard (CDN). 로컬 폰트로 렌더링하려면 환경변수 JHBT_FONT=/path/PretendardVariable.ttf
- JSON 형식은 4.6.4.json 을 참고. 지후가 아닌 항목은 id 대신 icon(이모지)을 쓴다 (4.6.5.json). groups[].kind 는 buff(상향) · nerf(하향) · adjust(조정) · new(신규) · fix(수정).
  lines 의 한 줄은 [항목, 이전, 이후] 또는 [설명 문장] 하나.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIND = {
    'buff': ('상향', '#1f9d55'),
    'nerf': ('하향', '#e5322d'),
    'adjust': ('조정', '#2f6fed'),
    'new': ('신규', '#9b59d0'),
    'fix': ('수정', '#f08c00'),
}


def portraits(ids):
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    start = src.index('const PORTRAITS = {')
    out = {}
    for pid in ids:
        m = re.search(r"^  " + re.escape(pid) + r": '(data:image/[^']+)'", src[start:], re.M)
        if m:
            out[pid] = m.group(1)
    return out


def esc(text):
    return html.escape(str(text))


def line_html(line, color):
    if len(line) == 1:
        return f'<div class="ln note"><i style="background:{color}"></i><span>{esc(line[0])}</span></div>'
    label, before, after = line
    before_html = '' if before in ('', '-') else f'<s>{esc(before)}</s><em>→</em>'
    return f'<div class="ln"><span class="k">{esc(label)}</span><span class="v">{before_html}<b style="color:{color}">{esc(after)}</b></span></div>'


def build(data):
    ids = [it['id'] for g in data['groups'] for it in g['items'] if it.get('id')]
    pics = portraits(ids)
    font_face = ''
    local_font = os.environ.get('JHBT_FONT')
    if local_font:
        font_face = f"@font-face {{ font-family:'Pretendard Variable'; src:url('file://{local_font}') format('truetype'); font-weight:100 900; }}"
    count = len(ids)
    hi_html = ''
    for h in data.get('highlights', []):
        color = KIND.get(h.get('kind', 'adjust'), KIND['adjust'])[1]
        change = f'<div class="chg"><s>{esc(h["from"])}</s><em>→</em><b style="color:{color}">{esc(h["to"])}</b></div>' if h.get('to') else ''
        note = f'<small>{esc(h["note"])}</small>' if h.get('note') else ''
        hi_html += f'<div class="hi"><span class="ic">{esc(h.get("icon", "★"))}</span><div class="tx"><b>{esc(h["title"])}</b><p>{esc(h["desc"])}</p>{note}</div>{change}</div>'
    groups_html = ''
    for g in data['groups']:
        label, color = KIND.get(g['kind'], KIND['adjust'])
        cards = ''
        for it in g['items']:
            pic = pics.get(it.get('id'))
            img = f'<img src="{pic}" alt="">' if pic else f'<span class="ph{" ico" if it.get("icon") else ""}">{esc(it.get("icon") or it["name"][:1])}</span>'
            suffix = '<span>지후</span>' if it.get('id') else ''
            tag = f'<span class="tag">{esc(it["tag"])}</span>' if it.get('tag') else ''
            lines = ''.join(line_html(l, color) for l in it['lines'])
            cards += f'<div class="card" style="--c:{color}"><div class="pic">{img}</div><div class="body"><div class="nm"><b>{esc(it["name"])}</b>{suffix}{tag}</div>{lines}</div></div>'
        groups_html += f'<section class="grp"><div class="gh"><span class="chip" style="background:{color}">{esc(g.get("label", label))}</span><i></i><small>{len(g["items"])}</small></div><div class="cards">{cards}</div></section>'
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=1080">
<title>JHBT {esc(data["version"])} 업데이트</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
{font_face}
* {{ box-sizing:border-box; margin:0; }}
body {{ background:#e9e8e4; font-family:'Pretendard Variable','Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif; color:#161616; }}
.sheet {{ width:1080px; margin:0 auto; background:#f6f5f1; position:relative; overflow:hidden; }}
.top {{ position:relative; padding:56px 64px 44px; background:#111; color:#f6f5f1; overflow:hidden; }}
.top::before {{ content:''; position:absolute; inset:0; background:repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 72px),repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 72px); }}
.top::after {{ content:''; position:absolute; right:-120px; top:-160px; width:520px; height:520px; border-radius:50%; background:radial-gradient(circle,rgba(229,50,45,.55),transparent 65%); }}
.brand {{ position:relative; z-index:1; display:flex; align-items:center; gap:10px; font:800 13px/1 ui-monospace,Menlo,monospace; letter-spacing:.32em; color:#9d9d98; }}
.brand i {{ width:8px; height:8px; border-radius:50%; background:#e5322d; box-shadow:0 0 10px #e5322d; }}
.ver {{ position:relative; z-index:1; margin-top:22px; display:flex; align-items:flex-end; gap:22px; }}
.ver b {{ font-size:112px; font-weight:900; letter-spacing:-.05em; line-height:.85; }}
.ver span {{ padding-bottom:10px; display:flex; flex-direction:column; gap:6px; }}
.ver strong {{ font-size:34px; font-weight:900; letter-spacing:-.03em; }}
.ver em {{ font-style:normal; font-size:17px; color:#bdbdb8; font-weight:600; }}
.meta {{ position:relative; z-index:1; margin-top:26px; display:flex; gap:10px; }}
.meta span {{ padding:7px 13px; border-radius:999px; border:1px solid #3a3a38; font:700 13px/1 ui-monospace,Menlo,monospace; color:#d8d8d4; letter-spacing:.06em; }}
.hl {{ display:grid; grid-template-columns:repeat({max(1, len(data.get("highlights", [])))},1fr); gap:14px; padding:28px 64px 0; }}
.hi {{ display:flex; align-items:center; gap:16px; padding:20px 22px; border-radius:20px; background:#fff; box-shadow:0 1px 0 #e3e2dd, 0 18px 30px -24px rgba(0,0,0,.35); }}
.hi .ic {{ flex:none; width:54px; height:54px; border-radius:16px; background:#f1f0ec; display:grid; place-items:center; font-size:28px; }}
.hi .tx {{ flex:1; min-width:0; }}
.hi .tx b {{ font-size:21px; font-weight:900; letter-spacing:-.02em; }}
.hi .tx p {{ margin-top:4px; font-size:15px; color:#555; line-height:1.45; }}
.hi .tx small {{ display:inline-block; margin-top:8px; padding:4px 9px; border-radius:8px; background:#f1f0ec; font-size:13px; font-weight:700; color:#333; }}
.hi .chg {{ flex:none; text-align:right; font-weight:900; }}
.hi .chg s {{ display:block; color:#aaa; font-size:17px; }}
.hi .chg em {{ display:none; }}
.hi .chg b {{ font-size:34px; letter-spacing:-.03em; }}
.grp {{ padding:30px 64px 0; }}
.gh {{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }}
.gh .chip {{ padding:7px 14px; border-radius:10px; color:#fff; font-size:15px; font-weight:900; letter-spacing:.02em; }}
.gh i {{ flex:1; height:1px; background:#d9d8d3; }}
.gh small {{ font:800 13px ui-monospace,Menlo,monospace; color:#999; }}
.cards {{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }}
.card {{ position:relative; display:flex; gap:16px; padding:18px 20px 18px 18px; border-radius:18px; background:#fff; box-shadow:0 1px 0 #e3e2dd, 0 16px 28px -24px rgba(0,0,0,.35); overflow:hidden; }}
.card::before {{ content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:var(--c); }}
.pic {{ flex:none; width:76px; height:76px; border-radius:50%; background:#f6f5f1; box-shadow:0 0 0 3px var(--c); display:grid; place-items:center; overflow:hidden; }}
.pic img {{ width:100%; height:100%; object-fit:contain; }}
.pic .ph {{ font-size:30px; font-weight:900; color:#aaa; }}
.pic .ph.ico {{ font-size:36px; color:inherit; }}
.body {{ flex:1; min-width:0; display:flex; flex-direction:column; gap:7px; }}
.nm {{ display:flex; align-items:baseline; gap:6px; flex-wrap:wrap; }}
.nm b {{ font-size:22px; font-weight:900; letter-spacing:-.03em; }}
.nm span {{ font-size:14px; color:#999; font-weight:700; }}
.nm .tag {{ margin-left:auto; padding:3px 8px; border-radius:7px; background:#f1f0ec; color:#555; font-size:12px; }}
.ln {{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; font-size:15px; border-top:1px dashed #ecebe6; padding-top:6px; }}
.ln .k {{ color:#666; font-weight:700; }}
.ln .v {{ display:flex; align-items:baseline; gap:6px; white-space:nowrap; }}
.ln .v s {{ color:#aaa; font-weight:700; }}
.ln .v em {{ font-style:normal; color:#c9c8c3; }}
.ln .v b {{ font-size:18px; font-weight:900; letter-spacing:-.02em; }}
.ln.note {{ justify-content:flex-start; align-items:center; gap:8px; color:#333; font-weight:700; }}
.ln.note i {{ flex:none; width:6px; height:6px; border-radius:50%; }}
.foot {{ margin-top:34px; padding:22px 64px 26px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid #e0dfda; font-size:14px; color:#888; font-weight:600; }}
.foot b {{ color:#161616; font-weight:900; letter-spacing:-.02em; }}
.foot span {{ font:700 13px ui-monospace,Menlo,monospace; letter-spacing:.05em; }}
</style></head><body>
<div class="sheet" id="sheet">
  <header class="top">
    <div class="brand"><i></i>지후끼리 야차까는겜 · JHBT</div>
    <div class="ver"><b>v{esc(data["version"])}</b><span><strong>{esc(data["title"])}</strong><em>{esc(data.get("subtitle", ""))}</em></span></div>
    <div class="meta"><span>{esc(data["date"])}</span><span>PATCH NOTES</span>{f'<span>지후 {count}종</span>' if count else ''}</div>
  </header>
  {f'<div class="hl">{hi_html}</div>' if hi_html else ''}
  {groups_html}
  <footer class="foot"><b>게임 안 패치노트에서 자세한 내용을 볼 수 있어요</b><span>wwwsebon-cloud.github.io/JHBT</span></footer>
</div>
</body></html>
'''


def main():
    path = sys.argv[1]
    data = json.load(open(path, encoding='utf-8'))
    out = os.path.splitext(path)[0] + '.html'
    open(out, 'w', encoding='utf-8').write(build(data))
    print(out)


if __name__ == '__main__':
    main()
