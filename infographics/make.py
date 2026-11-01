"""RE : 지후배틀 업데이트 인포그래픽 (디스코드 공지용) — JSON → HTML. (R2.13 리워크: 상단 요약 패널 없음 · 한 줄 목록 · 간략하게)

사용법:  python infographics/make.py infographics/R2.0.json   →  infographics/R2.0.html
         python infographics/shot.py infographics/R2.0.html   →  infographics/R2.0.png

JSON 형식
{
  "version": "R2.0", "date": "2026.10.22", "title": "손맛 업데이트", "subtitle": "한 줄 설명 (없어도 됨)",
  "width": 1600, "cols": 2,                                                    ← 없으면 1080 · 1단 (항목이 많으면 넓게 2단으로 · 너무 길쭉하지 않게)
  "chars": ["fire", "ice"],                                                    ← 제목 옆 초상화 (없으면 기본 지후 5)
  "sections": [
    { "kind": "new" | "balance" | "change" | "fix", "label": "새 기능",
      "items": [ { "icon": "✦" | "id": "fire", "title": "...", "lines": ["...", ...] } ] },   ← lines 는 「 · 」로 이어 한 줄 설명이 된다 (짧게)
    { "kind": "balance", "label": "밸런스",
      "stats": [ { "id": "ice", "stat": "공격력", "from": 33, "to": 70, "unit": "" },
                { "id": "moon", "stat": "공격 간격", "from": 2.4, "to": 2, "unit": "초", "lower": true },   ← lower: 작을수록 좋은 수치
                { "id": "x", "stat": "상한", "from": "없음", "to": 4, "unit": "개", "dir": "nerf" } ] }   ← 글자 값은 "dir": "buff" | "nerf" 로 방향을 직접
  ]
}
"headline" (예전 상단 요약 카드) 는 더 이상 그리지 않는다 (있어도 무시).
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
:root { --ink:#121316; --mut:#8a8c93; --sub:#484a52; --line:#ebebe7; --new:#2f6fed; --fix:#f08c00; --buff:#2f8a12; --buffbg:#e9f8df; --nerf:#d8352e; --nerfbg:#ffe9e7; }
body { background:#fff; font-family:'Pretendard Variable', Pretendard, 'Noto Sans CJK KR', sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased; padding:52px 64px 56px; }
.meta { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:800; letter-spacing:.14em; color:var(--mut); }
.meta i { width:4px; height:4px; border-radius:50%; background:var(--mut); } .meta .sp { flex:1; } .meta .d { letter-spacing:.04em; }
.hd { display:flex; align-items:center; gap:28px; margin-top:18px; padding-bottom:26px; border-bottom:3px solid var(--ink); }
.ver { font-size:76px; line-height:.92; font-weight:900; letter-spacing:-.05em; white-space:nowrap; }
.tt { flex:1; min-width:0; } .tt h1 { font-size:32px; line-height:1.2; font-weight:800; letter-spacing:-.03em; word-break:keep-all; } .tt p { margin-top:6px; font-size:16px; line-height:1.45; color:var(--mut); font-weight:600; word-break:keep-all; }
.chars { display:flex; flex:none; padding-right:10px; } .chars span { width:58px; height:58px; margin-right:-12px; border-radius:50%; overflow:hidden; background:#fff; border:3px solid #fff; box-shadow:0 0 0 1px var(--line); }
img { width:100%; height:100%; object-fit:cover; display:block; }
.sec { margin-top:30px; }
.sh { display:flex; align-items:center; gap:10px; margin-bottom:4px; }
.sh .k { padding:3px 9px; border-radius:6px; font-size:11px; font-weight:900; letter-spacing:.12em; color:#fff; background:var(--ink); } .sh .k.new { background:var(--new); } .sh .k.fix { background:var(--fix); } .sh .k.balance { background:linear-gradient(90deg, var(--buff) 50%, var(--nerf) 50%); }
.sh h2 { font-size:21px; font-weight:800; letter-spacing:-.02em; } .sh .n { font-size:14px; font-weight:800; color:var(--mut); }
.list { display:grid; grid-template-columns:repeat(var(--cols), minmax(0, 1fr)); column-gap:44px; }
.it { display:grid; grid-template-columns:30px var(--tw) minmax(0, 1fr); column-gap:14px; align-items:start; padding:12px 0; border-top:1px solid var(--line); }
.ic { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#f3f3f0; font-size:16px; overflow:hidden; } .ic.p { background:#fff; box-shadow:0 0 0 1px var(--line); }
.it b { padding-top:4px; font-size:16.5px; line-height:1.35; font-weight:800; letter-spacing:-.02em; word-break:keep-all; }
.it p { padding-top:5px; font-size:14.5px; line-height:1.5; font-weight:500; color:var(--sub); word-break:keep-all; }
.bal { display:grid; grid-template-columns:repeat(var(--bc), minmax(0, 1fr)); column-gap:44px; }
.bal h3 { display:flex; align-items:center; gap:6px; padding:10px 0 8px; font-size:13px; font-weight:900; letter-spacing:.08em; color:var(--buff); } .bal .down h3 { color:var(--nerf); } .bal h3 span { color:var(--mut); font-weight:700; letter-spacing:0; }
.br { display:grid; grid-template-columns:40px var(--nw) minmax(0, 1fr); column-gap:12px; align-items:center; padding:8px 0; border-top:1px solid var(--line); }
.br .pic { width:40px; height:40px; border-radius:50%; overflow:hidden; background:#fff; box-shadow:0 0 0 1px var(--line); }
.br .nm { font-size:15.5px; font-weight:800; letter-spacing:-.02em; word-break:keep-all; }
.br .cs { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
.ch { display:inline-flex; align-items:baseline; gap:7px; padding:5px 11px; border-radius:10px; white-space:nowrap; color:var(--buff); background:var(--buffbg); } .down .ch { color:var(--nerf); background:var(--nerfbg); }
.ch small { font-size:12.5px; font-weight:700; opacity:.75; } .ch b { font-size:16px; font-weight:900; letter-spacing:-.02em; } .ch s { text-decoration:none; font-weight:700; opacity:.55; font-size:.84em; } .ch i { font-style:normal; margin:0 4px; opacity:.6; font-weight:700; }
"""


def pic(id_):
    return f'<img src="{PORTRAITS[id_]}" alt="">' if id_ in PORTRAITS else ''


def icon(it):
    if it.get('id'):
        return f'<span class="ic p">{pic(it["id"])}</span>'
    return f'<span class="ic">{e(it.get("icon", "✦"))}</span>'


def fmt(v):
    if isinstance(v, (int, float)):
        return f'{v:,.10g}'
    return str(v)


def stat_dir(st):  # 'buff' | 'nerf' — 숫자는 자동 (lower: 작을수록 좋은 수치) · 글자 값은 dir 로
    if st.get('dir') in ('buff', 'nerf'):
        return st['dir']
    a, b = float(st['from']), float(st['to'])
    return 'nerf' if (b < a) != bool(st.get('lower')) else 'buff'


def chip(st):
    unit = st.get('unit', '')
    fu = unit if isinstance(st['from'], (int, float)) else ''
    return f'<span class="ch"><small>{e(st["stat"])}</small><b><s>{e(fmt(st["from"]))}{e(fu)}</s><i>→</i>{e(fmt(st["to"]))}{e(unit)}</b></span>'


def stat_rows(stats):  # 같은 지후는 한 줄로 묶는다 (처음 나온 순서)
    order, by = [], {}
    for st in stats:
        if st['id'] not in by:
            order.append(st['id']); by[st['id']] = []
        by[st['id']].append(st)
    return [f'<div class="br"><span class="pic">{pic(i)}</span><span class="nm">{e(NAMES.get(i, i))}</span><span class="cs">{"".join(chip(st) for st in by[i])}</span></div>' for i in order]


def section(sec, cols):
    kind = sec['kind'] if sec['kind'] in ('new', 'balance', 'change', 'fix') else 'new'
    label = {'new': 'NEW', 'balance': 'BALANCE', 'change': 'CHANGE', 'fix': 'FIX'}[kind]
    body, n = '', 0
    if sec.get('items'):
        rows = [f'<div class="it">{icon(it)}<b>{e(it["title"])}</b><p>{e(" · ".join(it.get("lines", [])))}</p></div>' for it in sec['items']]
        body += f'<div class="list">{"".join(rows)}</div>'; n += len(rows)
    if sec.get('stats'):
        up = stat_rows([s for s in sec['stats'] if stat_dir(s) == 'buff'])
        down = stat_rows([s for s in sec['stats'] if stat_dir(s) == 'nerf'])
        n += len(sec['stats'])
        if up and down:  # 상향 · 하향 두 칸
            body += f'<div class="bal" style="--bc:2"><div class="up"><h3>▲ 상향 <span>{len(up)}</span></h3>{"".join(up)}</div><div class="down"><h3>▼ 하향 <span>{len(down)}</span></h3>{"".join(down)}</div></div>'
        else:  # 한쪽만 있으면 그 목록을 단 수대로 나눈다
            rows, cls, h = (up, 'up', '▲ 상향') if up else (down, 'down', '▼ 하향')
            body += f'<div class="bal {cls}" style="--bc:1"><div class="{cls}"><h3>{h} <span>{len(rows)}</span></h3><div class="list">{"".join(rows)}</div></div></div>'
    return f'<div class="sec"><div class="sh"><span class="k {kind}">{label}</span><h2>{e(sec["label"])}</h2><span class="n">{n}</span></div>{body}</div>'


def build(d):
    w, cols = int(d.get('width', 1080)), int(d.get('cols', 1))
    tw = 168  # 제목 칸 너비
    chars = ''.join(f'<span>{pic(i)}</span>' for i in d.get('chars', ['fire', 'ice', 'sword', 'assassin', 'shield']))
    secs = ''.join(section(s, cols) for s in d['sections'])
    sub = f'<p>{e(d["subtitle"])}</p>' if d.get('subtitle') else ''
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="info-width" content="{w}"><style>{CSS}body {{ width:{w}px; --cols:{cols}; --tw:{tw}px; --nw:{120 if cols == 1 else 140}px; }}</style></head><body>
  <div class="meta"><span>RE : 지후배틀</span><i></i><span>UPDATE NOTE</span><span class="sp"></span><span class="d">{e(d['date'])}</span></div>
  <div class="hd"><div class="ver">{e(d["version"])}</div><div class="tt"><h1>{e(d["title"])}</h1>{sub}</div><div class="chars">{chars}</div></div>
  {secs}
</body></html>"""


def main():
    src = sys.argv[1]
    d = json.load(open(src, encoding='utf-8'))
    out = os.path.splitext(src)[0] + '.html'
    open(out, 'w', encoding='utf-8').write(build(d))
    print(out)


if __name__ == '__main__':
    main()
