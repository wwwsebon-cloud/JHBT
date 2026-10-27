"""RE : 지후배틀 업데이트 인포그래픽 (디스코드 공지용) — JSON → HTML. (R2.11 리워크: 모던 심플 · 밸런스는 연두 상향 / 빨강 하향 2단)

사용법:  python infographics/make.py infographics/R2.0.json   →  infographics/R2.0.html
         python infographics/shot.py infographics/R2.0.html   →  infographics/R2.0.png

JSON 형식
{
  "version": "R2.0", "date": "2026.10.22", "title": "손맛 업데이트", "subtitle": "한 줄 설명",
  "width": 1600, "cols": 2,                                                    ← 없으면 1080 · 1단 (항목이 많으면 넓게 2단으로 · 너무 길쭉하지 않게)
  "headline": [ { "icon": "✦", "title": "...", "desc": "..." }, ... ]          ← 크게 보여 줄 3개
  "sections": [
    { "kind": "new" | "balance" | "change" | "fix", "label": "새 기능",
      "items": [ { "icon": "✦" | "id": "fire", "title": "...", "lines": ["...", ...] } ] },
    { "kind": "balance", "label": "밸런스",
      "stats": [ { "id": "ice", "stat": "공격력", "from": 33, "to": 70, "unit": "" },
                { "id": "moon", "stat": "공격 간격", "from": 2.4, "to": 2, "unit": "초", "lower": true },   ← lower: 작을수록 좋은 수치
                { "id": "x", "stat": "상한", "from": "없음", "to": 4, "unit": "개", "dir": "nerf" } ] }   ← 글자 값은 "dir": "buff" | "nerf" 로 방향을 직접
  ]
}
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PORTRAITS = json.load(open(os.path.join(HERE, 'portraits.json'), encoding='utf-8'))
NAMES = {'fire': '화염 지후', 'ice': '얼음 지후', 'sword': '검 지후', 'assassin': '암살 지후', 'shield': '쉴드 지후', 'accel': '가속 지후', 'lonely': '고독한 지후', 'berserk': '광폭화 지후', 'scythe': '낫 지후', 'moon': '달 지후', 'levelup': '레벨업 지후', 'magic': '마탄 지후', 'gift': '선물 지후', 'slime': '슬라임 지후', 'atom': '원자 지후', 'dice': '주사위 지후', 'gun': '총 지후', 'coin': '코인 지후', 'combo': '콤보 지후', 'heal': '힐 지후', 'water': '물 지후', 'berserker': '버서커 지후', 'slot': '슬롯머신 지후', 'bow': '활 지후', 'dust': '황사 지후', 'cactus': '선인장 지후', 'jaws': '죠스 지후', 'blizzard': '블리자드 지후', 'bat': '빠따 지후', 'train': '신칸센 지후', 'titanium': '티타늄 지후', 'sun': '태양 지후', 'whirl': '회오리 지후', 'gumiho': '구미호 지후', 'necro': '네크로맨서 지후', 'deathnote': '데스노트 지후', 'rifle': '라이플 지후', 'bubble': '버블 지후', 'prophecy': '예언 지후', 'joker': '조커 지후', 'syringe': '주사 지후', 'tentacle': '촉수 지후', 'lantern': '랜턴 지후', 'lightning': '번개 지후', 'barrier': '보호막 지후', 'revive': '부활 지후', 'reaper': '사신 지후', 'guardian': '수호자 지후', 'clock': '시계 지후', 'charge': '충전 지후', 'devour': '포식 지후', 'bomb': '폭탄 지후', 'nuke': '핵미사일 지후', 'star': '별 지후', 'sommelier': '소믈리에 지후', 'chicken': '닭 지후', 'pan': '후라이팬 지후', 'growth': '성장 지후', 'melody': '선율 지후', 'tailwind': '순풍 지후', 'lock': '자물쇠 지후', 'radiation': '방사능 지후', 'antigrav': '반중력 지후', 'teemo': '티모 지후', 'rain': '비 지후', 'nou': 'NO U 지후', 'venom': '독 지후', 'biker': '폭주족 지후', 'lament': '솔렘라멘트 지후', 'soulcaller': '강령술사 지후', 'laser': '빔 지후'}
e = html.escape
CSS = r"""
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
* { box-sizing:border-box; margin:0; }
:root { --ink:#121316; --mut:#8a8c93; --line:#e7e7e3; --card:#f6f6f3; --buff:#8be04e; --buffd:#2f6b0f; --nerf:#ff5650; }
body { background:#fff; font-family:'Pretendard Variable', Pretendard, 'Noto Sans CJK KR', sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased; padding:64px 72px 48px; }
.sp { flex:1; }
.top { display:flex; align-items:center; gap:12px; font-size:15px; font-weight:700; color:var(--mut); letter-spacing:.04em; }
.top .pill { padding:3px 11px; border-radius:999px; background:var(--ink); color:#fff; font-size:12px; letter-spacing:.12em; }
.hero { display:flex; align-items:flex-end; gap:32px; margin:40px 0 8px; }
.hero .t { flex:1; min-width:0; }
.ver { font-size:128px; line-height:.9; font-weight:900; letter-spacing:-.055em; }
h1 { word-break:keep-all; margin-top:22px; font-size:44px; line-height:1.2; font-weight:800; letter-spacing:-.03em; }
.hero p { margin-top:10px; font-size:19px; color:var(--mut); font-weight:500; }
.chars { display:flex; padding-right:12px; } .chars span { width:84px; height:84px; margin-right:-18px; border-radius:50%; overflow:hidden; background:#fff; border:4px solid #fff; box-shadow:0 0 0 1px var(--line); } .chars img, .p img, .pic img { width:100%; height:100%; object-fit:cover; display:block; }
.heads { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin:44px 0 0; }
.head { background:var(--card); border-radius:22px; padding:22px 24px; display:flex; flex-direction:column; gap:6px; }
.head .ic { width:52px; height:52px; border-radius:50%; margin-bottom:8px; } .head b { font-size:21px; font-weight:800; letter-spacing:-.02em; } .head small { font-size:14.5px; line-height:1.45; color:var(--mut); font-weight:500; word-break:keep-all; }
.ic { display:flex; align-items:center; justify-content:center; flex:none; width:44px; height:44px; border-radius:50%; background:var(--ink); color:#fff; font-size:21px; overflow:hidden; } .ic.p { background:#fff; box-shadow:0 0 0 1px var(--line); }
.sec { margin-top:52px; }
.sh { display:flex; align-items:center; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--ink); }
.sh h2 { font-size:26px; font-weight:800; letter-spacing:-.025em; } .sh .k { padding:3px 10px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:.1em; background:var(--ink); color:#fff; } .sh .k.balance { background:linear-gradient(90deg, var(--buff) 50%, var(--nerf) 50%); color:var(--ink); } .sh .n { margin-left:auto; font:700 13px ui-monospace, Consolas, monospace; color:var(--mut); }
.items { display:grid; grid-template-columns:repeat(var(--cols), 1fr); gap:14px; margin-top:20px; align-items:start; }
.item { display:flex; gap:16px; background:var(--card); border-radius:20px; padding:20px 22px; } .item b { display:block; font-size:19px; font-weight:800; letter-spacing:-.02em; margin:2px 0 8px; }
.item ul { list-style:none; padding:0; display:flex; flex-direction:column; gap:6px; } .item li { position:relative; padding-left:13px; font-size:14.5px; line-height:1.5; font-weight:500; color:#3b3d44; word-break:keep-all; } .item li::before { content:''; position:absolute; left:0; top:.62em; width:5px; height:5px; border-radius:50%; background:var(--ink); }
.bal { display:grid; grid-template-columns:1fr 1fr; gap:26px; margin-top:24px; }
.col > h3 { display:flex; align-items:center; gap:8px; margin-bottom:14px; font-size:14px; font-weight:800; letter-spacing:.12em; } .col > h3 i { width:10px; height:10px; border-radius:50%; background:var(--buff); } .col.nerf > h3 i { background:var(--nerf); } .col > h3 span { color:var(--mut); font-weight:600; letter-spacing:0; }
.row { position:relative; display:flex; align-items:center; margin-bottom:12px; padding-left:34px; }
.row .pic { position:absolute; left:0; z-index:2; width:70px; height:70px; border-radius:50%; overflow:hidden; background:#fff; border:4px solid #fff; box-shadow:0 0 0 1px rgba(0,0,0,.08); }
.row .pl { flex:1; min-height:64px; border-radius:18px; padding:8px 20px 8px 52px; margin-left:0; background:var(--buff); color:var(--ink); display:flex; align-items:center; gap:14px; }
.row.nerf .pl { background:var(--nerf); color:#fff; }
.row .pl small { flex:1; min-width:0; font-size:14px; line-height:1.3; font-weight:700; opacity:.78; word-break:keep-all; } .row .pl small b { display:block; font-size:16px; opacity:1; font-weight:800; }
.row .pl em { font-style:normal; font-size:26px; font-weight:900; letter-spacing:-.03em; white-space:nowrap; } .row .pl em s { font-size:.66em; font-weight:700; text-decoration:none; opacity:.6; } .row .pl em i { font-style:normal; margin:0 6px; font-weight:700; opacity:.7; }
.none { padding:20px; border:1px dashed var(--line); border-radius:18px; color:var(--mut); font-size:14px; font-weight:600; text-align:center; }
.wrap.wide { display:grid; grid-template-columns:500px 1fr; gap:64px; margin-top:36px; align-items:start; }
.wide .hero { flex-direction:column; align-items:flex-start; gap:28px; margin:0; } .wide .chars { padding-right:0; margin-left:18px; } .wide .heads { grid-template-columns:1fr; gap:12px; margin:36px 0 0; }
.wide .head { display:grid; grid-template-columns:52px 1fr; column-gap:16px; row-gap:2px; padding:16px 20px; } .wide .head .ic { grid-row:1 / 3; margin:0; align-self:center; } .wide .head small { grid-column:2; }
.wide .sec:first-child { margin-top:0; }
.foot { display:flex; align-items:center; gap:14px; margin-top:60px; padding-top:20px; border-top:1px solid var(--line); font-size:14px; font-weight:700; color:var(--mut); } .foot b { color:var(--ink); font-size:16px; }
"""


def pic(id_):
    return f'<img src="{PORTRAITS[id_]}" alt="">' if id_ in PORTRAITS else ''


def icon(it, cls='ic'):
    if it.get('id'):
        return f'<span class="{cls} p">{pic(it["id"])}</span>'
    return f'<span class="{cls}">{e(it.get("icon", "✦"))}</span>'


def fmt(v):
    if isinstance(v, (int, float)):
        return f'{v:,.10g}'
    return str(v)


def stat_dir(st):  # 'buff' | 'nerf' — 숫자는 자동 (lower: 작을수록 좋은 수치) · 글자 값은 dir 로
    if st.get('dir') in ('buff', 'nerf'):
        return st['dir']
    a, b = float(st['from']), float(st['to'])
    return 'nerf' if (b < a) != bool(st.get('lower')) else 'buff'


def stat_row(st):
    d, unit = stat_dir(st), st.get('unit', '')
    return (f'<div class="row {d}"><span class="pic">{pic(st["id"])}</span><div class="pl"><small><b>{e(NAMES.get(st["id"], st["id"]))}</b>{e(st["stat"])}</small>'
            f'<em><s>{e(fmt(st["from"]))}{e(unit if isinstance(st["from"], (int, float)) else "")}</s><i>→</i>{e(fmt(st["to"]))}{e(unit)}</em></div></div>')


def section(sec, idx, cols):
    kind = sec['kind']
    label = {'new': 'NEW', 'balance': 'BALANCE', 'change': 'CHANGE', 'fix': 'FIX'}.get(kind, 'NEW')
    body = ''
    if sec.get('items'):
        rows = []
        for it in sec['items']:
            lines = ''.join(f'<li>{e(l)}</li>' for l in it.get('lines', []))
            rows.append(f'<div class="item">{icon(it)}<div><b>{e(it["title"])}</b><ul>{lines}</ul></div></div>')
        body += f'<div class="items">{"".join(rows)}</div>'
    if sec.get('stats'):
        buff = [stat_row(s) for s in sec['stats'] if stat_dir(s) == 'buff']
        nerf = [stat_row(s) for s in sec['stats'] if stat_dir(s) == 'nerf']
        none = '<div class="none">변경 없음</div>'
        body += (f'<div class="bal"><div class="col buff"><h3><i></i>BUFF <span>상향 {len(buff)}</span></h3>{"".join(buff) or none}</div>'
                 f'<div class="col nerf"><h3><i></i>NERF <span>하향 {len(nerf)}</span></h3>{"".join(nerf) or none}</div></div>')
    return f'<div class="sec"><div class="sh"><span class="k {kind}">{label}</span><h2>{e(sec["label"])}</h2><span class="n">{idx:02d}</span></div>{body}</div>'


def build(d):
    chars = ''.join(f'<span>{pic(i)}</span>' for i in d.get('chars', ['fire', 'ice', 'sword', 'assassin', 'shield']))
    heads = ''.join(f'<div class="head">{icon(h)}<b>{e(h["title"])}</b><small>{e(h["desc"])}</small></div>' for h in d['headline'])
    w, cols = int(d.get('width', 1080)), int(d.get('cols', 1))
    secs = ''.join(section(s, i + 1, cols) for i, s in enumerate(d['sections']))
    hero = f'<div class="hero"><div class="t"><div class="ver">{e(d["version"])}</div><h1>{e(d["title"])}</h1><p>{e(d["subtitle"])}</p></div><div class="chars">{chars}</div></div><div class="heads">{heads}</div>'
    body = f'<div class="wrap wide"><div class="left">{hero}</div><div class="right">{secs}</div></div>' if d.get('layout') == 'wide' else hero + secs  # layout "wide": 가로형 (왼쪽 소개 · 오른쪽 내용)
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="info-width" content="{w}"><style>{CSS}body {{ width:{w}px; --cols:{cols}; }}</style></head><body>
  <div class="top"><span>RE:JHBT</span><span class="pill">UPDATE</span><span class="sp"></span><span>{e(d['date'])}</span></div>
  {body}
  <div class="foot"><b>RE : 지후배틀</b><span>RE:JHBT · {e(d['version'])}</span><span class="sp"></span><span>{e(d['date'])}</span></div>
</body></html>"""


def main():
    src = sys.argv[1]
    d = json.load(open(src, encoding='utf-8'))
    out = os.path.splitext(src)[0] + '.html'
    open(out, 'w', encoding='utf-8').write(build(d))
    print(out)


if __name__ == '__main__':
    main()
