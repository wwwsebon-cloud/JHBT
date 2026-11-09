"""티어 시뮬 결과 반영 (R2.22.2 · R1 tools/tierlist/apply.py 를 R2 에 맞게)
사용법: python3 tools/tierlist/apply.py <작업폴더> <버전> <날짜 YYYY.MM.DD>
  1) index.html 의 TIER_SC (봇 덱 고르기 · 전투력) — 티어마다 점수 띠 (S 80~100 · A 65~79 · B 40~64 · C 20~39 · D 0~19) 안에 승률 순으로 고르게
  2) infographics/tier-<버전>.json (make.py "type": "tierlist") — 지난 티어보다 오르면 ▲ · 내리면 ▼ · 처음이면 NEW · 안정도가 낮으면 「경계」
  3) tools/tierlist/history/<버전>.json (판 수 · 지후별 점수 · 오차 · 실제 승률 · 피해 비중 · 안정도)
"""
import json, os, re, shutil, sys

W, ver, date = sys.argv[1], sys.argv[2], sys.argv[3]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
d = json.load(open(os.path.join(W, 'agg.json'), encoding='utf-8'))
info = json.load(open(os.path.join(W, 'info.json'), encoding='utf-8'))
meta, rows = d['meta'], d['rows']
BAND = {'SS': (90, 100), 'S': (80, 89), 'A': (65, 79), 'B': (40, 64), 'C': (20, 39), 'D': (0, 19)}  # R2.26: SS 추가
ORDER = ['SS', 'S', 'A', 'B', 'C', 'D']
UNSURE = 60  # 안정도(%)가 이보다 낮으면 경계 지후

# 1) TIER_SC
sc = {}
for t in ORDER:
    L = [x for x in rows if x['tier'] == t]  # 이미 점수 내림차순
    lo, hi = BAND[t]
    for k, x in enumerate(L):
        sc[x['id']] = round(hi - (hi - lo) * (k / (len(L) - 1) if len(L) > 1 else 0))
p = os.path.join(ROOT, 'index.html')
s = open(p, 'rb').read().decode('utf-8')
m = re.search(r'const TIER_SC = \{[^}]*\}', s)
assert m, 'TIER_SC 를 못 찾았다'
s = s[:m.start()] + 'const TIER_SC = ' + json.dumps(sc, ensure_ascii=False, separators=(',', ':')) + s[m.end():]
open(p, 'wb').write(s.encode('utf-8'))

# 2) 티어표 인포그래픽 JSON
mv = lambda x: '' if not x['prev'] or (os.environ.get('LEGACY_PREV') and x['prev'] == 'S' and x['tier'] == 'SS') else (  # LEGACY_PREV: 예전 5티어 S → SS 는 그대로로 본다
     'up' if ORDER.index(x['tier']) < ORDER.index(x['prev']) else 'down' if ORDER.index(x['tier']) > ORDER.index(x['prev']) else '')
tiers = []
for t in ORDER:
    ids = [{'id': x['id'], 'name': info.get(x['id'], {}).get('name', x['id']), 'rarity': info.get(x['id'], {}).get('rarity', ''), 'wr': x['wr'],
            'mv': mv(x) or ('new' if not x['prev'] else ''), 'unsure': x['stab'] is not None and x['stab'] < UNSURE} for x in rows if x['tier'] == t]
    tiers.append({'t': t, 'ids': ids})
up = sum(1 for x in rows if mv(x) == 'up'); down = sum(1 for x in rows if mv(x) == 'down')
note = (f"무작위 10기로 5:5 자동 대전 {meta['games']:,}판 — 같은 10기를 진영만 바꿔 두 번씩 · 지후마다 나오는 판 수를 고르게 (Lv1 · 랭크 없음 · 이벤트 없음 · 60초가 지나면 남은 체력으로 판정). "
        f"숫자는 팀 실력 모델로 계산한 기대 승률이에요 (50% = 평균). ▲ ▼ 는 지난 티어보다 오르거나 내린 지후 (▲ {up} · ▼ {down}) · 흐린 테두리는 판을 다시 뽑아 보면 티어가 자주 바뀌는 경계 지후예요. "
        f"판을 넘겨 쌓이는 능력 (포식 · 소믈리에 · 예언 · 핵미사일 · 괴도 · 슬롯머신 잭팟 등) 은 한 판만으로는 다 드러나지 않아요.")
tj = {'type': 'tierlist', 'version': ver, 'date': date, 'title': '지후 티어표', 'subtitle': '밸런스 패치 뒤 · 자동 대전 시뮬레이션 기준', 'note': note, 'tiers': tiers}
json.dump(tj, open(os.path.join(ROOT, 'infographics', f'tier-{ver}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# 3) 기록
hd = os.path.join(ROOT, 'tools', 'tierlist', 'history'); os.makedirs(hd, exist_ok=True)
json.dump({'version': ver, 'date': date, 'meta': meta, 'tier_sc': sc, 'rows': rows}, open(os.path.join(hd, f'{ver}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
shutil.copy(os.path.join(W, 'result.txt'), os.path.join(hd, f'{ver}.txt'))
print('반영', ver, {t: len(next(x for x in tiers if x['t'] == t)['ids']) for t in ORDER}, f'▲{up} ▼{down}', '경계', sum(1 for x in rows if x['stab'] is not None and x['stab'] < UNSURE))
