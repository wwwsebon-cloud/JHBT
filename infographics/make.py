"""RE : 지후배틀 업데이트 인포그래픽 (디스코드 공지용) — JSON → HTML. (R2.13 리워크: 상단 요약 패널 없음 · 한 줄 목록 · 간략하게)

사용법:  python infographics/make.py infographics/R2.0.json   →  infographics/R2.0.html (장이 여럿이면 R2.0-2.html …)
         python infographics/shot.py infographics/R2.0*.html  →  .png (여러 파일을 한 번에)
         JSON 은 node infographics/notes2json.js <버전> [--new] 로 만든다 (먼저 node infographics/extract.js)

JSON 형식
{
  "version": "R2.0", "date": "2026.10.22", "title": "손맛 업데이트", "subtitle": "한 줄 설명 (없어도 됨)",
  "width": 1600, "cols": 2,                                                    ← 없으면 1080 · 1단 (항목이 많으면 넓게 2단으로 · 너무 길쭉하지 않게)
  "theme": "dark",                                                             ← (R2.17.2) 게임 남색 디자인 · tiles 가 있으면 늘 dark
  "chars": ["fire", "ice"],                                                    ← 제목 옆 초상화 (없으면 기본 지후 5)
  "sections": [
    { "kind": "new" | "balance" | "change" | "fix", "label": "새 기능",
      "items": [ { "icon": "✦" | "id": "fire", "title": "...", "lines": ["...", ...] } ] },   ← lines 는 「 · 」로 이어 한 줄 설명이 된다 (짧게)
    { "kind": "change", "label": "전투 표시", "items": [...], "shots": [ { "src": "shots/R2.22-b3-spy.png", "cap": "설명" } ] },   ← (R2.22 build 3) 게임 스크린샷 (infographics/ 기준 경로 · 한 줄에 나란히)
    { "kind": "balance", "label": "밸런스",
      "stats": [ { "id": "ice", "stat": "공격력", "from": 33, "to": 70, "unit": "" },
                { "id": "moon", "stat": "공격 간격", "from": 2.4, "to": 2, "unit": "초", "lower": true },   ← lower: 작을수록 좋은 수치
                { "id": "x", "stat": "상한", "from": "없음", "to": 4, "unit": "개", "dir": "nerf" } ] },   ← 글자 값은 "dir": "buff" | "nerf" 로 방향을 직접
    { "kind": "balance", "label": "밸런스",                                    ← (R2.17.2) 밸런스가 많을 때: 5칸 타일 (초상화 + 색 띠 · 상향 초록 · 조정 주황 · 하향 빨강)
      "tiles": [ { "id": "fire", "name": "화염 지후", "rarity": "common", "tag": "buff" | "adjust" | "nerf",
                   "lines": [ { "stat": "체력", "from": 1020, "to": 1840, "unit": "" }, { "text": "짧은 설명" } ] } ] }
  ]
}
신규 지후 인포그래픽 (R2.17.2): { "type": "newchars", "version", "date", "title", "subtitle", "chars": [ { "id", "name", "rarity", "role", "hp", "atk", "atkText",
  "atkSpeed", "range", "noAttack", "community", "passive", "skill" } ] } — 설명의 ⟦..⟧ 는 강조 · 지후 수에 맞춰 1 · 2 · 3 · 4단 (8명 넘으면 여러 장)
티어표 (R2.17.2): { "type": "tierlist", "version", "date", "title", "subtitle", "note": "아래 설명",
  "tiers": [ { "t": "S", "ids": [ { "id": "fire", "wr": 64.5, "rarity": "common" } ] } ] } — 줄마다 티어 칸 + 초상화 (이름 · 표시 승률)
"headline" (예전 상단 요약 카드) 는 더 이상 그리지 않는다 (있어도 무시).
"""
import base64
import html
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PORTRAITS = json.load(open(os.path.join(HERE, 'portraits.json'), encoding='utf-8'))
NAMES = {'fire': '화염 지후', 'ice': '얼음 지후', 'sword': '검 지후', 'assassin': '암살 지후', 'shield': '쉴드 지후', 'accel': '가속 지후', 'lonely': '고독한 지후', 'berserk': '광폭화 지후', 'scythe': '낫 지후', 'moon': '달 지후', 'levelup': '레벨업 지후', 'magic': '마탄 지후', 'gift': '선물 지후', 'slime': '슬라임 지후', 'atom': '원자 지후', 'dice': '주사위 지후', 'gun': '총 지후', 'coin': '코인 지후', 'combo': '콤보 지후', 'heal': '힐 지후', 'water': '물 지후', 'berserker': '버서커 지후', 'slot': '슬롯머신 지후', 'bow': '활 지후', 'dust': '황사 지후', 'cactus': '선인장 지후', 'jaws': '죠스 지후', 'blizzard': '블리자드 지후', 'bat': '빠따 지후', 'train': '신칸센 지후', 'titanium': '티타늄 지후', 'sun': '태양 지후', 'whirl': '회오리 지후', 'gumiho': '구미호 지후', 'necro': '네크로맨서 지후', 'deathnote': '데스노트 지후', 'rifle': '라이플 지후', 'bubble': '버블 지후', 'prophecy': '예언 지후', 'joker': '조커 지후', 'syringe': '주사 지후', 'tentacle': '촉수 지후', 'lantern': '랜턴 지후', 'lightning': '번개 지후', 'barrier': '보호막 지후', 'revive': '부활 지후', 'reaper': '사신 지후', 'guardian': '수호자 지후', 'clock': '시계 지후', 'charge': '충전 지후', 'devour': '포식 지후', 'bomb': '폭탄 지후', 'nuke': '핵미사일 지후', 'star': '별 지후', 'sommelier': '소믈리에 지후', 'chicken': '닭 지후', 'pan': '후라이팬 지후', 'growth': '성장 지후', 'melody': '선율 지후', 'tailwind': '순풍 지후', 'lock': '자물쇠 지후', 'radiation': '방사능 지후', 'antigrav': '반중력 지후', 'teemo': '티모 지후', 'rain': '비 지후', 'nou': 'NO U 지후', 'venom': '독 지후', 'biker': '폭주족 지후', 'lament': '솔렘라멘트 지후', 'soulcaller': '강령술사 지후', 'laser': '빔 지후', 'god': '갓지후', 'archaeo': '고고학자 지후', 'rush': '돌격 지후', 'thief': '괴도 지후', 'bullet': '탄환 지후', 'holy': '성검 지후', 'roulette': '러시안룰렛 지후', 'tyrant': '폭군 지후', 'bbgun': 'BB탄 지후', 'hong': '홍명보 지후', 'emp': 'EMP 지후', 'dragon': '드래곤 지후', 'frog': '개구리 지후', 'monolith': '모노리스 지후', 'exynos': '엑시노스 지후', 'engineer': '엔지니어 지후', 'warp': '왜곡 지후', 'sniper': '저격 지후', 'dj': 'DJ 지후', 'arcane': '아케인 지후', 'prince': '왕자 지후', 'mafia': '마피아 지후', 'c4': 'C4 지후', 'burglar': '도둑 지후', 'blackhole': '블랙홀 지후', 'mercury': '수은 지후', 'spy': '스파이 지후', 'cowboy': '카우보이 지후'}
RARITY = {'common': '일반', 'rare': '희귀', 'epic': '영웅', 'legend': '전설'}
e = html.escape
FONTS = "@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'); @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Lilita+One&family=Do+Hyeon&display=swap');"
CSS = r"""
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
# R2.17.2: 게임 남색 디자인 (타일 · 신규 지후) — 아래 끝은 단색이어야 shot.py 가 남는 부분을 자른다 (위쪽 빛은 .glow 하나)
DARK = r"""
html { background:#141a2b; }
body.dark { --ink:#f2f4fa; --mut:#9aa3bf; --sub:#c9cfe2; --line:#2f3858; --card:#2c3553; --edge:#3b466b; --deep:#1a2034; --gold:#ffc94a; --mint:#53d3c0;
  position:relative; background:#141a2b; color:var(--ink); padding:46px 56px 50px; overflow:hidden; }
body.dark .glow { position:absolute; left:0; right:0; top:0; height:560px; background:radial-gradient(ellipse 70% 100% at 50% 0%, rgba(98,124,230,.38), rgba(98,124,230,0) 70%); pointer-events:none; }
body.dark > * { position:relative; }
body.dark .hd { border-bottom:3px solid var(--edge); }
body.dark .ver, body.dark .tt h1 { font-family:'Black Han Sans', 'Pretendard Variable', sans-serif; font-weight:400; letter-spacing:-.01em; }
body.dark .ver { font-size:84px; color:#fff; text-shadow:0 5px 0 #0b0f1c; } body.dark .tt h1 { font-size:38px; }
body.dark .chars span { border-color:var(--card); box-shadow:0 0 0 2px var(--edge); }
body.dark .pg { flex:none; padding:8px 16px; border-radius:999px; background:var(--card); border:2px solid var(--edge); font-size:15px; font-weight:900; color:var(--gold); letter-spacing:.06em; }
body.dark .sh .k { background:var(--edge); } body.dark .sh .k.new { background:var(--new); } body.dark .sh .k.change { background:#53d3c0; color:#10202a; }
body.dark .sh h2 { font-family:'Black Han Sans', sans-serif; font-weight:400; font-size:26px; }
body.dark .shots { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0, 1fr); gap:24px; margin-top:20px; } body.dark .shots figure { margin:0; border-radius:20px; overflow:hidden; background:var(--card); box-shadow:0 0 0 2px var(--edge); } body.dark .shots img { display:block; width:100%; height:auto; background:#fff; } body.dark .shots figcaption { padding:12px 16px; font-size:15px; font-weight:700; line-height:1.4; color:var(--sub); word-break:keep-all; } /* R2.22 build 3: 게임 스크린샷 */
body.dark .it { border-top-color:var(--line); } body.dark .ic { background:var(--deep); } body.dark .ic.p { background:#fff; box-shadow:0 0 0 2px var(--edge); }
body.dark .it p { color:var(--sub); }
/* 밸런스 타일 (R2.22.1 개편: 단색 타일 · 굵은 검은 테두리 · Black Han Sans · 글자마다 검은 외곽선 · 수치는 가운데 크게 · 초상화가 왼쪽에 걸친다) */
.lg { display:flex; gap:10px; margin:2px 0 16px; } .lg span { padding:5px 14px 4px; border-radius:10px; border:3px solid #0c1020; font-family:'Black Han Sans', sans-serif; font-weight:400; font-size:17px; color:#fff; -webkit-text-stroke:3px #0c1020; paint-order:stroke fill; box-shadow:0 3px 0 #0c1020; }
.lg .buff { background:var(--tb); } .lg .adjust { background:var(--ta); } .lg .nerf { background:var(--tn); }
:root { --tb:#3cc23a; --ta:#f59a1b; --tn:#e8392f; --ol:#0c1020; } /* 타일 색: 상향 · 조정 · 하향 (단색) */
.tg { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); grid-auto-flow:column; grid-auto-rows:142px; gap:18px 24px; } /* R2.22.1: 한 줄 4칸 · 높이 모두 같게 */
.tl { position:relative; display:flex; align-items:center; height:142px; }
.tl .pp { position:absolute; left:0; top:50%; z-index:2; width:106px; height:106px; margin-top:-53px; box-sizing:border-box; border-radius:24px; overflow:hidden; background:#fff; border:5px solid var(--ol); box-shadow:0 5px 0 var(--ol); }
.tl .rb { flex:1; min-width:0; margin-left:52px; height:130px; box-sizing:border-box; padding:6px 10px 6px 62px; border-radius:16px; border:5px solid var(--ol); box-shadow:0 6px 0 var(--ol); background:var(--tb);
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:2px; color:#fff;
  font-family:'Lilita One', 'Do Hyeon', sans-serif; font-weight:400; letter-spacing:.01em; paint-order:stroke fill; } /* 숫자 · 영문 Lilita One · 한글 Do Hyeon (사용자가 고름) */
.tl.adjust .rb { background:var(--ta); } .tl.nerf .rb { background:var(--tn); }
.tl .nm { font-size:20px; line-height:1.1; -webkit-text-stroke:4px var(--ol); paint-order:stroke fill; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; color:#ffe27a; }
.tl .ln { display:flex; flex-direction:column; align-items:center; gap:0; font-size:36px; line-height:1.05; -webkit-text-stroke:6px var(--ol); paint-order:stroke fill; word-break:keep-all; } .tl .ln .v { white-space:nowrap; }
.tl .ln small { font-size:23px; line-height:1.15; -webkit-text-stroke:4.5px var(--ol); paint-order:stroke fill; } .tl .ln s { text-decoration:none; } .tl .ln i { font-style:normal; margin:0 6px; }
.tl .tx { font-size:23px; line-height:1.18; -webkit-text-stroke:4.5px var(--ol); paint-order:stroke fill; word-break:keep-all; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.tl.one.lv .ln { font-size:27px; -webkit-text-stroke:5px var(--ol); } /* 값이 길면 조금 작게 */
.tl.dense .ln { flex-direction:row; flex-wrap:wrap; justify-content:center; align-items:baseline; gap:0 6px; font-size:22px; -webkit-text-stroke:4px var(--ol); } .tl.dense .ln small { font-size:17px; -webkit-text-stroke:3px var(--ol); } .tl.dense .tx { font-size:17px; -webkit-text-stroke:3px var(--ol); }
/* 신규 지후 카드 */
.ncg { display:flex; flex-wrap:wrap; justify-content:center; gap:26px; margin-top:34px; }
.nc { --rc:#c9c9c6; position:relative; width:calc((100% - 26px * (var(--nc) - 1)) / var(--nc)); display:flex; flex-direction:column; gap:14px; padding:24px 24px 22px; border-radius:26px; background:var(--card); border:2px solid var(--edge); box-shadow:0 7px 0 #0f1424; overflow:hidden; }
.nc.r-rare { --rc:#4f9dff; } .nc.r-epic { --rc:#b26bff; } .nc.r-legend { --rc:#ffc21a; }
.nc::before { content:''; position:absolute; left:0; right:0; top:0; height:170px; background:radial-gradient(ellipse 80% 100% at 30% 0%, color-mix(in srgb, var(--rc) 42%, transparent), transparent 75%); }
.nc > * { position:relative; }
.nc .top { display:flex; align-items:center; gap:18px; }
.nc .pp { flex:none; width:var(--pp); height:var(--pp); border-radius:50%; overflow:hidden; background:#fff; border:5px solid var(--rc); box-shadow:0 0 0 4px #0c1020, 0 0 26px color-mix(in srgb, var(--rc) 55%, transparent); }
.nc .who { min-width:0; } .nc .tags { display:flex; flex-wrap:wrap; gap:6px; }
.nc .tags span { padding:3px 10px; border-radius:999px; font-size:13px; font-weight:900; background:var(--deep); color:var(--sub); border:1px solid var(--edge); }
.nc .tags .rar { background:var(--rc); color:#141a2b; border-color:transparent; } .nc .tags .cm { background:#53d3c0; color:#0e2420; border-color:transparent; }
.nc h2 { margin-top:8px; font-family:'Black Han Sans', sans-serif; font-weight:400; font-size:var(--nf); line-height:1.05; color:#fff; text-shadow:0 3px 0 #0b0f1c; word-break:keep-all; }
.nc .sts { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px; }
.nc .sts div { padding:8px 6px 7px; border-radius:12px; background:var(--deep); border:1px solid var(--edge); text-align:center; }
.nc .sts b.sm { font-size:14px; white-space:normal; line-height:1.25; word-break:keep-all; } .nc .sts small { display:block; font-size:12px; font-weight:800; color:var(--mut); } .nc .sts b { display:block; margin-top:2px; font-size:19px; font-weight:900; color:#fff; letter-spacing:-.02em; white-space:nowrap; }
.nc .ab { padding:12px 14px; border-radius:14px; background:rgba(26,32,52,.72); border:1px solid var(--edge); }
.nc .ab .k { display:inline-block; margin-bottom:6px; padding:2px 9px; border-radius:6px; font-size:12px; font-weight:900; letter-spacing:.06em; background:var(--edge); color:var(--ink); } .nc .ab.sk .k { background:var(--gold); color:#2a1d00; }
.nc .ab p { font-size:var(--tf); line-height:1.55; font-weight:600; color:var(--sub); word-break:keep-all; } .nc .ab p b { color:var(--gold); font-weight:900; }
.nc.one { flex-direction:row; align-items:flex-start; gap:30px; } .nc.one .side { flex:none; width:300px; display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center; } .nc.one .main { flex:1; min-width:0; display:flex; flex-direction:column; gap:14px; }
.nc.one .tags { justify-content:center; }
/* 티어표 */
.tr { display:flex; align-items:stretch; margin-top:16px; border-radius:20px; overflow:hidden; background:var(--card); border:2px solid var(--edge); box-shadow:0 6px 0 #0f1424; }
.tr .tl2 { flex:none; width:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; color:#141a2b; background:var(--tc); }
.tr .tl2 b { font-family:'Black Han Sans', sans-serif; font-weight:400; font-size:74px; line-height:1; } .tr .tl2 small { font-size:14px; font-weight:900; opacity:.75; }
.tr.S { --tc:#ff5f5f; } .tr.A { --tc:#ffad33; } .tr.B { --tc:#ffd84a; } .tr.C { --tc:#7ee05a; } .tr.D { --tc:#6fb2ff; }
.tr .ps { flex:1; display:flex; flex-wrap:wrap; gap:16px 10px; padding:18px 20px; align-content:center; }
.tc { width:112px; display:flex; flex-direction:column; align-items:center; gap:5px; text-align:center; }
.tc .pp { width:88px; height:88px; border-radius:50%; overflow:hidden; background:#fff; border:4px solid var(--rc, #c9c9c6); box-shadow:0 0 0 3px #0c1020; }
.tc.r-rare { --rc:#4f9dff; } .tc.r-epic { --rc:#b26bff; } .tc.r-legend { --rc:#ffc21a; }
.tc .pp { position:relative; overflow:visible; } .tc .pp img { border-radius:50%; } .tc .mv { position:absolute; right:-8px; top:-6px; min-width:26px; height:26px; padding:0 5px; box-sizing:border-box; border-radius:13px; border:3px solid #0c1020; font-style:normal; font-size:13px; font-weight:900; line-height:20px; text-align:center; color:#fff; } .tc .mv.up { background:#3cc23a; } .tc .mv.down { background:#e8392f; } .tc .mv.new { background:#4f7cff; font-size:10px; } .tc.unsure .pp { border-style:dashed; opacity:.8; } /* R2.22.2: ▲ ▼ NEW · 경계 */
.tc b { font-size:15px; font-weight:900; color:#fff; line-height:1.15; word-break:keep-all; } .tc small { font-size:13px; font-weight:800; color:var(--mut); }
.tnote { margin-top:22px; font-size:15px; line-height:1.6; font-weight:600; color:var(--mut); }
"""


def pic(id_):
    return f'<img src="{PORTRAITS[id_]}" alt="">' if id_ in PORTRAITS else ''


def shot_img(src):  # R2.22 build 3: 스크린샷을 HTML 안에 (infographics/ 기준 경로)
    with open(os.path.join(HERE, src), 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()


def shots(L):
    return '<div class="shots">' + ''.join(f'<figure><img src="{shot_img(s["src"])}" alt=""><figcaption>{e(s.get("cap", ""))}</figcaption></figure>' for s in L) + '</div>'


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
    if sec.get('shots'):
        body += shots(sec['shots'])
    if sec.get('stats'):
        up = stat_rows([s for s in sec['stats'] if stat_dir(s) == 'buff'])
        down = stat_rows([s for s in sec['stats'] if stat_dir(s) == 'nerf'])
        n += len({x['id'] for x in sec['stats']})  # 지후 수 (한 지후의 수치 여러 개는 하나로)
        if up and down:  # 상향 · 하향 두 칸
            body += f'<div class="bal" style="--bc:2"><div class="up"><h3>▲ 상향 <span>{len(up)}</span></h3>{"".join(up)}</div><div class="down"><h3>▼ 하향 <span>{len(down)}</span></h3>{"".join(down)}</div></div>'
        else:  # 한쪽만 있으면 그 목록을 단 수대로 나눈다
            rows, cls, h = (up, 'up', '▲ 상향') if up else (down, 'down', '▼ 하향')
            body += f'<div class="bal {cls}" style="--bc:1"><div class="{cls}"><h3>{h} <span>{len(rows)}</span></h3><div class="list">{"".join(rows)}</div></div></div>'
    return f'<div class="sec"><div class="sh"><span class="k {kind}">{label}</span><h2>{e(sec["label"])}</h2>{f'<span class="n">{n}</span>' if n else ''}</div>{body}</div>'


# ── R2.17.2 밸런스 타일 ──
TILE_COLS, TILE_ROWS_FIRST, TILE_ROWS = 4, 6, 9  # 첫 장은 다른 항목 아래라 6줄 · 다음 장부터 9줄 (1920 × 약 1080)
TAG_ORDER = {'nerf': 0, 'adjust': 1, 'buff': 2}


def tile_line(l):
    if 'stat' in l:
        fu = l.get('unit', '') if isinstance(l['from'], (int, float)) else ''
        v = ' class="v"' if len(f'{l["from"]}{l["to"]}') <= 16 else ''  # 값이 짧으면 「a → b」를 붙여서 · 길면 그대로 줄바꿈
        return f'<span class="ln"><small>{e(l["stat"])}</small><span{v}><s>{e(fmt(l["from"]))}{e(fu)}</s><i>→</i>{e(fmt(l["to"]))}{e(l.get("unit", ""))}</span></span>'
    return f'<span class="tx">{e(l["text"])}</span>'


def tile(t):
    lines = t.get('lines', [])
    dense = ' dense' if len(lines) >= 3 or any(len(str(l.get('text', ''))) > 26 for l in lines) else ''
    if t.get('one'): dense = ' one' + (' lv' if any('stat' in l and len(f"{fmt(l['from'])}{fmt(l['to'])}{l.get('unit', '')}") > 11 for l in lines) else '')  # 변경 하나: 이름 · 수치 이름 · 값 세 줄 (값을 크게 · 값이 길면 조금 작게)
    r = f' r-{t["rarity"]}' if t.get('rarity') else ''
    return f'<div class="tl {t.get("tag", "buff")}{r}{dense}"><span class="pp">{pic(t["id"])}</span><div class="rb"><span class="nm">{e(t.get("name") or NAMES.get(t["id"], t["id"]))}</span>{"".join(tile_line(l) for l in lines[:4])}</div></div>'


LOWER_BETTER = re.compile(r'간격|쿨|대기|손실|(^|\s|\])SP$')  # 낮을수록 좋은 수치 (「SP 충전」 같은 충전량은 높을수록 좋다)


def line_dir(l, tag):  # 타일 하나 색: 지후 전체가 상향 · 하향이면 그대로 · 조정이면 수치 방향으로 (문장 · 글자 값은 조정)
    if tag in ('buff', 'nerf'):
        return tag
    if 'stat' in l and isinstance(l['from'], (int, float)) and isinstance(l['to'], (int, float)) and l['from'] != l['to']:
        up = l['to'] > l['from']
        return 'buff' if up != bool(LOWER_BETTER.search(l['stat'].strip())) else 'nerf'
    return 'adjust'


def split_tiles(tiles):  # R2.22.1: 한 지후의 변경이 여러 개면 타일을 나눈다 (참고: 브롤스타즈 밸런스 요약 그림)
    out = []
    for t in tiles:
        L = t.get('lines', [])
        if len(L) <= 1:
            out.append({**t, 'one': True}); continue
        for l in L:
            out.append({**t, 'tag': line_dir(l, t.get('tag')), 'lines': [l], 'one': True})
    return out


def tile_grid(tiles):
    rows = math.ceil(len(tiles) / TILE_COLS)
    return f'<div class="tg" style="grid-template-rows:repeat({rows}, auto)">{"".join(tile(t) for t in tiles)}</div>'


def legend(tiles):
    c = {k: sum(1 for t in tiles if t.get('tag') == k) for k in ('buff', 'adjust', 'nerf')}
    lab = {'buff': '▲ 상향', 'adjust': '◆ 조정', 'nerf': '▼ 하향'}
    return '<div class="lg">' + ''.join(f'<span class="{k}">{lab[k]} {c[k]}</span>' for k in ('buff', 'adjust', 'nerf') if c[k]) + '</div>'


def head(d, page='', chars=None):
    chars = ''.join(f'<span>{pic(i)}</span>' for i in (chars or d.get('chars', ['fire', 'ice', 'sword', 'assassin', 'shield'])))
    sub = f'<p>{e(d["subtitle"])}</p>' if d.get('subtitle') else ''
    pg = f'<span class="pg">{e(page)}</span>' if page else ''
    kind = {'newchars': 'NEW JIHOO', 'tierlist': 'TIER LIST'}.get(d.get('type'), 'UPDATE NOTE')
    return f"""<div class="meta"><span>RE : 지후배틀</span><i></i><span>{kind}</span><span class="sp"></span><span class="d">{e(d['date'])}</span></div>
  <div class="hd"><div class="ver">{e(d["version"])}</div><div class="tt"><h1>{e(d["title"])}</h1>{sub}</div>{pg}<div class="chars">{chars}</div></div>"""


def doc(d, w, body, extra_style='', cls=''):
    css = FONTS + CSS + (DARK if cls == 'dark' else '')
    glow = '<div class="glow"></div>' if cls == 'dark' else ''
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="info-width" content="{w}"><style>{css}body {{ width:{w}px; {extra_style} }}</style></head><body class="{cls}">{glow}
  {body}
</body></html>"""


def build(d):  # → [html, ...] (장마다 하나)
    if d.get('type') == 'newchars':
        return build_new(d)
    if d.get('type') == 'tierlist':
        return build_tier(d)
    w, cols = int(d.get('width', 1080)), int(d.get('cols', 1))
    style = f'--cols:{cols}; --tw:168px; --nw:{120 if cols == 1 else 140}px;'
    tiles, other = [], []
    for s in d['sections']:
        if s.get('tiles'):
            tiles += s['tiles']
            rest = {k: v for k, v in s.items() if k != 'tiles'}
            if rest.get('items') or rest.get('stats'):
                other.append(rest)
        else:
            other.append(s)
    dark = 'dark' if tiles or d.get('theme') == 'dark' else ''
    if not tiles:
        return [doc(d, w, head(d) + ''.join(section(s, cols) for s in other), style, dark)]
    w = max(w, 1920)
    tiles = sorted(tiles, key=lambda t: TAG_ORDER.get(t.get('tag'), 2))  # 하향 → 조정 → 상향 (같은 묶음 안은 패치노트 순서)
    tiles = split_tiles(tiles)  # R2.22.1: 변경 하나 = 타일 하나 (같은 지후는 연달아)
    first = TILE_COLS * (TILE_ROWS_FIRST if other else TILE_ROWS)
    chunks, i = [tiles[:first]], first
    while i < len(tiles):
        chunks.append(tiles[i:i + TILE_COLS * TILE_ROWS]); i += TILE_COLS * TILE_ROWS
    labs = list(dict.fromkeys(s['label'] for s in d['sections'] if s.get('tiles'))); lab = ' · '.join(sorted(labs, key=lambda x: x != '밸런스')) or '밸런스'  # R2.20: 리워크 · 밸런스 두 묶음이면 둘 다
    out = []
    for k, ch in enumerate(chunks):
        page = f'{k + 1} / {len(chunks)}' if len(chunks) > 1 else ''
        sh = f'<div class="sec"><div class="sh"><span class="k balance">BALANCE</span><h2>{e(lab)}{" (계속)" if k else ""}</h2><span class="n">{len({t["id"] for t in tiles})}</span></div>{legend(tiles) if k == 0 else ""}{tile_grid(ch)}</div>'
        body = head(d, page, [t['id'] for t in ch[:5]] if k else None) + (''.join(section(s, 2) for s in other) if k == 0 else '') + sh
        out.append(doc(d, w, body, style, 'dark'))
    return out


# ── R2.17.2 신규 지후 ──
def rich(t):  # ⟦강조⟧ → <b>
    return re.sub(r'⟦(.*?)⟧', r'<b>\1</b>', e(t or ''))


def nc_stats(c):
    rg = '근접' if c.get('range') == 'melee' else f'{fmt(c.get("range"))}칸'
    atk = c.get('atkText') or ('—' if c.get('noAttack') or not c.get('atk') else fmt(c.get('atk')))
    iv = '—' if c.get('noAttack') else f'{fmt(c.get("atkSpeed"))}초'
    return ''.join(f'<div><small>{k}</small><b{" class=sm" if len(str(v)) > 6 else ""}>{e(str(v))}</b></div>' for k, v in (('체력', fmt(c.get('hp'))), ('공격력', atk), ('공격 간격', iv), ('사거리', rg)))


def nc_card(c, one=False):
    tags = f'<span class="rar">{RARITY.get(c.get("rarity"), "")}</span><span>{e(c.get("role", ""))}</span>' + (f'<span class="cm">커뮤니티 제작 · {e(c["community"])}</span>' if c.get('community') else '')
    ab = (f'<div class="ab"><span class="k">패시브</span><p>{rich(c["passive"])}</p></div>' if c.get('passive') else '') + (f'<div class="ab sk"><span class="k">스킬</span><p>{rich(c["skill"])}</p></div>' if c.get('skill') else '')
    who = f'<div class="who"><div class="tags">{tags}</div><h2>{e(c.get("name") or NAMES.get(c["id"], c["id"]))}</h2></div>'
    if one:
        return f'<div class="nc one r-{c.get("rarity")}"><div class="side"><span class="pp">{pic(c["id"])}</span>{who}</div><div class="main"><div class="sts">{nc_stats(c)}</div>{ab}</div></div>'
    return f'<div class="nc r-{c.get("rarity")}"><div class="top"><span class="pp">{pic(c["id"])}</span>{who}</div><div class="sts">{nc_stats(c)}</div>{ab}</div>'


def build_new(d):
    cs = d['chars']; n = len(cs)
    per = 8  # 한 장에 최대 8명 (4단 × 2줄)
    out, pages = [], [cs[i:i + per] for i in range(0, n, per)]
    for k, pc in enumerate(pages):
        m = len(pc) if len(pages) == 1 else per
        cols = 1 if m == 1 else 2 if m == 2 else 3 if m in (3, 5, 6) else 4
        w = {1: 1280, 2: 1600}.get(cols, 1920)
        pp, nf, tf = {1: (260, 54, 18), 2: (150, 40, 17), 3: (128, 34, 16), 4: (112, 30, 15)}[cols]
        page = f'{k + 1} / {len(pages)}' if len(pages) > 1 else ''
        cards = ''.join(nc_card(c, cols == 1) for c in pc)
        body = head(d, page, [c['id'] for c in pc[:5]]) + f'<div class="ncg">{cards}</div>'
        out.append(doc(d, w, body, f'--nc:{cols}; --pp:{pp}px; --nf:{nf}px; --tf:{tf}px;', 'dark'))
    return out


# ── R2.17.2 티어표 ──
def short(n):
    return re.sub(r' ?지후$', '', n or '') or n


def tier_card(c):  # 초상화 · 이름 · 표시 승률
    wr = f'<small>{c["wr"]:.1f}%</small>' if c.get('wr') is not None else ''
    mv = {'up': '<i class="mv up">▲</i>', 'down': '<i class="mv down">▼</i>', 'new': '<i class="mv new">NEW</i>'}.get(c.get('mv'), '')  # R2.22.2: 지난 티어보다 오름 · 내림 · 처음
    un = ' unsure' if c.get('unsure') else ''  # 판을 다시 뽑으면 티어가 자주 바뀌는 경계 지후
    return f'<div class="tc r-{c.get("rarity", "")}{un}"><span class="pp">{pic(c["id"])}{mv}</span><b>{e(short(c.get("name") or NAMES.get(c["id"], c["id"])))}</b>{wr}</div>'


def build_tier(d):
    rows = []
    for t in d['tiers']:
        cards = ''.join(tier_card(c) for c in t['ids'])
        rows.append(f'<div class="tr {e(t["t"])}"><div class="tl2"><b>{e(t["t"])}</b><small>{len(t["ids"])}기</small></div><div class="ps">{cards}</div></div>')
    note = f'<p class="tnote">{e(d["note"])}</p>' if d.get('note') else ''
    top = [c['id'] for c in d['tiers'][0]['ids'][:5]] if d['tiers'] else None
    return [doc(d, int(d.get('width', 1920)), head(d, '', top) + ''.join(rows) + note, '', 'dark')]


def main():
    src = sys.argv[1]
    d = json.load(open(src, encoding='utf-8'))
    base = os.path.splitext(src)[0]
    for k, h in enumerate(build(d)):
        out = base + ('.html' if k == 0 else f'-{k + 1}.html')
        open(out, 'w', encoding='utf-8').write(h)
        print(out)


if __name__ == '__main__':
    main()
