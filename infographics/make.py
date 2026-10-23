"""RE : 지후배틀 업데이트 인포그래픽 (디스코드 공지용) — JSON → HTML.

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
                { "id": "moon", "stat": "공격 간격", "from": 2.4, "to": 2, "unit": "초", "lower": true } ] }   ← lower: 작을수록 좋은 수치
  ]
}
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PORTRAITS = json.load(open(os.path.join(HERE, 'portraits.json'), encoding='utf-8'))
NAMES = {'fire': '화염 지후', 'ice': '얼음 지후', 'sword': '검 지후', 'assassin': '암살 지후', 'shield': '쉴드 지후', 'accel': '가속 지후', 'lonely': '고독한 지후', 'berserk': '광폭화 지후', 'scythe': '낫 지후', 'moon': '달 지후', 'levelup': '레벨업 지후', 'magic': '마탄 지후', 'gift': '선물 지후', 'slime': '슬라임 지후', 'atom': '원자 지후', 'dice': '주사위 지후', 'gun': '총 지후', 'coin': '코인 지후', 'combo': '콤보 지후', 'heal': '힐 지후', 'water': '물 지후', 'berserker': '버서커 지후', 'slot': '슬롯머신 지후', 'bow': '활 지후', 'dust': '황사 지후', 'cactus': '선인장 지후', 'jaws': '죠스 지후', 'blizzard': '블리자드 지후', 'bat': '빠따 지후', 'train': '신칸센 지후', 'titanium': '티타늄 지후', 'sun': '태양 지후', 'whirl': '회오리 지후', 'gumiho': '구미호 지후', 'necro': '네크로맨서 지후', 'deathnote': '데스노트 지후', 'rifle': '라이플 지후', 'bubble': '버블 지후', 'prophecy': '예언 지후', 'joker': '조커 지후', 'syringe': '주사 지후', 'tentacle': '촉수 지후', 'lantern': '랜턴 지후', 'lightning': '번개 지후', 'barrier': '보호막 지후', 'revive': '부활 지후', 'reaper': '사신 지후', 'guardian': '수호자 지후', 'clock': '시계 지후', 'charge': '충전 지후', 'devour': '포식 지후', 'bomb': '폭탄 지후', 'nuke': '핵미사일 지후', 'star': '별 지후', 'sommelier': '소믈리에 지후', 'chicken': '닭 지후', 'pan': '후라이팬 지후', 'growth': '성장 지후', 'melody': '선율 지후', 'tailwind': '순풍 지후', 'lock': '자물쇠 지후'}
KIND = {'new': ('NEW', '#111', '#f2f2f0'), 'balance': ('BALANCE', '#e5322d', '#fff'), 'change': ('CHANGE', '#555', '#fff'), 'fix': ('FIX', '#8f8f8c', '#fff')}
e = html.escape

CSS = r"""
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
* { box-sizing:border-box; margin:0; }
body { width:1080px; background:#f4f4f2; font-family:'Pretendard Variable', Pretendard, sans-serif; color:#111; -webkit-font-smoothing:antialiased; }
.mono { font-family:ui-monospace, Consolas, monospace; }
.disp { font-family:'Arial Black', 'Pretendard Variable', sans-serif; letter-spacing:-.05em; }
/* 상단: 검은 띠 · 큰 버전 번호 · 격자 */
.hero { position:relative; background:#0f0f0e; color:#f2f2f0; padding:56px 64px 120px; overflow:hidden;
  background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0 1px,transparent 1px 88px),repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0 1px,transparent 1px 88px); }
.hero .top { display:flex; align-items:center; gap:14px; font:800 13px ui-monospace, Consolas, monospace; letter-spacing:.32em; color:#8f8f8c; }
.hero .top .pill { border:1px solid #444; border-radius:999px; padding:6px 14px; letter-spacing:.2em; color:#f2f2f0; }
.hero .top .sp { flex:1; }
.hero .ver { margin-top:36px; font:900 168px 'Arial Black', 'Pretendard Variable', sans-serif; letter-spacing:-.07em; line-height:.85; }
.hero .ver small { font-size:56px; letter-spacing:-.04em; color:#8f8f8c; margin-right:10px; }
.hero h1 { margin-top:26px; font:900 58px 'Pretendard Variable', sans-serif; letter-spacing:-.04em; }
.hero p { margin-top:12px; font-size:22px; color:#bdbdba; }
.hero .chars { position:absolute; right:56px; top:150px; display:flex; }
.hero .chars span { width:96px; height:96px; border-radius:50%; overflow:hidden; border:3px solid #f2f2f0; background:#f2f2f0; margin-left:-22px; box-shadow:0 10px 24px rgba(0,0,0,.5); }
.hero .chars img { width:100%; height:100%; object-fit:cover; }
/* 헤드라인 3장: 검은 띠 위로 겹쳐 올라온다 */
.heads { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; padding:0 64px; margin-top:-78px; position:relative; }
.head { background:#fff; border:2px solid #111; border-radius:22px; padding:26px 24px 24px; box-shadow:8px 8px 0 #111; min-height:200px; display:flex; flex-direction:column; gap:10px; }
.head .ic { width:56px; height:56px; border-radius:50%; background:#111; color:#f2f2f0; display:grid; place-items:center; font-size:26px; overflow:hidden; }
.head .ic img { width:100%; height:100%; object-fit:cover; }
.head b { font-size:25px; font-weight:900; letter-spacing:-.03em; line-height:1.25; }
.head small { font-size:16px; color:#555; line-height:1.5; }
/* 섹션: 왼쪽 세로 라벨 + 오른쪽 내용 */
.sec { display:grid; grid-template-columns:120px 1fr; gap:0; margin:44px 64px 0; border-top:2px solid #111; }
.sec .lab { padding-top:22px; }
.sec .lab .k { display:inline-block; writing-mode:vertical-rl; transform:rotate(180deg); font:900 30px 'Arial Black', sans-serif; letter-spacing:.06em; color:var(--k); }
.sec .lab .n { display:block; margin-top:12px; font:800 13px ui-monospace, Consolas, monospace; color:#8f8f8c; letter-spacing:.1em; }
.sec .body { padding-top:22px; display:grid; grid-template-columns:repeat(var(--cols, 1), minmax(0, 1fr)); gap:14px; align-items:stretch; }
.sec .body > h2 { grid-column:1 / -1; }
.sec h2 { font:900 30px 'Pretendard Variable', sans-serif; letter-spacing:-.04em; }
.item { display:grid; grid-template-columns:64px 1fr; gap:18px; align-items:start; background:#fff; border:1px solid #d9d9d6; border-radius:18px; padding:18px 20px; }
.item .ic { width:64px; height:64px; border-radius:16px; background:#111; color:#f2f2f0; display:grid; place-items:center; font-size:28px; overflow:hidden; }
.item .ic.p { border-radius:50%; background:#f2f2f0; border:2px solid #111; }
.item .ic img { width:100%; height:100%; object-fit:cover; }
.item b { display:block; font-size:22px; font-weight:900; letter-spacing:-.03em; margin-top:2px; }
.item ul { list-style:none; padding:0; margin-top:6px; display:flex; flex-direction:column; gap:4px; }
.item li { font-size:17px; color:#444; line-height:1.5; padding-left:18px; position:relative; }
.item li::before { content:''; position:absolute; left:2px; top:11px; width:7px; height:7px; border-radius:2px; background:#111; }
/* 밸런스: 이전 → 이후 막대 */
.stat { display:grid; grid-template-columns:64px 170px 1fr 150px; gap:16px; align-items:center; background:#fff; border:1px solid #d9d9d6; border-radius:18px; padding:14px 20px; }
.stat .pic { width:58px; height:58px; border-radius:50%; overflow:hidden; border:2px solid #111; background:#f2f2f0; }
.stat .pic img { width:100%; height:100%; object-fit:cover; }
.stat .nm b { display:block; font-size:20px; font-weight:900; } .stat .nm small { font:800 13px ui-monospace, Consolas, monospace; color:#8f8f8c; letter-spacing:.08em; }
.stat .bars { display:flex; flex-direction:column; gap:6px; }
.stat .bar { height:12px; border-radius:12px; background:#ecece9; overflow:hidden; }
.stat .bar i { display:block; height:100%; border-radius:12px; }
.stat .bar.old i { background:#bdbdba; } .stat .bar.new i { background:#111; } .stat.down .bar.new i { background:#e5322d; }
.stat .val { text-align:right; font:900 30px ui-monospace, Consolas, monospace; letter-spacing:-.02em; }
.stat .val s { font-size:18px; color:#8f8f8c; margin-right:6px; } .stat .val em { font-style:normal; display:block; font-size:13px; letter-spacing:.12em; color:#111; }
.stat.down .val em { color:#e5322d; }
/* 바닥 */
.foot { margin:54px 0 0; background:#0f0f0e; color:#8f8f8c; padding:30px 64px; display:flex; align-items:center; font:800 14px ui-monospace, Consolas, monospace; letter-spacing:.24em; }
.foot b { color:#f2f2f0; font:900 26px 'Arial Black', sans-serif; letter-spacing:-.04em; margin-right:18px; }
.foot .sp { flex:1; }
"""


def pic(id_):
    return f'<img src="{PORTRAITS[id_]}" alt="">' if id_ in PORTRAITS else ''


def icon(it, cls='ic'):
    if it.get('id'):
        return f'<span class="{cls} p">{pic(it["id"])}</span>'
    return f'<span class="{cls}">{e(it.get("icon", "✦"))}</span>'


def section(sec, idx):
    k, color, _ = KIND.get(sec['kind'], KIND['new'])
    rows = []
    for it in sec.get('items', []):
        lines = ''.join(f'<li>{e(l)}</li>' for l in it.get('lines', []))
        rows.append(f'<div class="item">{icon(it)}<div><b>{e(it["title"])}</b><ul>{lines}</ul></div></div>')
    for st in sec.get('stats', []):
        a, b = float(st['from']), float(st['to'])
        mx = max(a, b) * 1.08 or 1
        down = (b < a) != bool(st.get('lower'))  # lower: 값이 작을수록 좋은 수치 (공격 간격 등) → 줄면 상향
        unit = st.get('unit', '')
        fmt = lambda v: (f'{v:g}' if isinstance(v, float) else str(v))
        tag = '하향' if down else '상향'
        rows.append(f'''<div class="stat{' down' if down else ''}"><span class="pic">{pic(st['id'])}</span>
          <span class="nm"><b>{e(NAMES.get(st['id'], st['id']))}</b><small>{e(st['stat'])}</small></span>
          <span class="bars"><span class="bar old"><i style="width:{a / mx * 100:.1f}%"></i></span><span class="bar new"><i style="width:{b / mx * 100:.1f}%"></i></span></span>
          <span class="val"><s>{fmt(a)}{unit}</s>{fmt(b)}{unit}<em>{tag}</em></span></div>''')
    return f'''<div class="sec" style="--k:{color}"><div class="lab"><span class="k">{k}</span><span class="n">{idx:02d}</span></div>
      <div class="body"><h2>{e(sec['label'])}</h2>{''.join(rows)}</div></div>'''


def build(d):
    chars = ''.join(f'<span>{pic(i)}</span>' for i in d.get('chars', ['fire', 'ice', 'sword', 'assassin', 'shield']))
    heads = ''.join(f'<div class="head">{icon(h)}<b>{e(h["title"])}</b><small>{e(h["desc"])}</small></div>' for h in d['headline'])
    secs = ''.join(section(s, i + 1) for i, s in enumerate(d['sections']))
    w, cols = int(d.get('width', 1080)), int(d.get('cols', 1))
    return f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="info-width" content="{w}"><style>{CSS}body {{ width:{w}px; --cols:{cols}; }}</style></head><body>
  <div class="hero"><div class="top"><span>RE:JHBT</span><span class="pill">UPDATE</span><span class="sp"></span><span>{e(d['date'])}</span></div>
    <div class="ver">{e(d['version'])}</div><h1>{e(d['title'])}</h1><p>{e(d['subtitle'])}</p><div class="chars">{chars}</div></div>
  <div class="heads">{heads}</div>
  {secs}
  <div class="foot"><b>RE : 지후배틀</b><span>RE:JHBT · {e(d['version'])}</span><span class="sp"></span><span>{e(d['date'])}</span></div>
</body></html>'''


def main():
    src = sys.argv[1]
    d = json.load(open(src, encoding='utf-8'))
    out = os.path.splitext(src)[0] + '.html'
    open(out, 'w', encoding='utf-8').write(build(d))
    print(out)


if __name__ == '__main__':
    main()
