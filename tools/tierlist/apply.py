"""agg.json → index.html (TIER_HISTORY 맨 앞에 새 표 · BOT_TIER_LIST 교체).
사용법: python3 tools/tierlist/apply.py <작업폴더> <버전> <날짜 YYYY.MM.DD> <판수>"""
import json, sys
W, ver, date, games = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
out = json.load(open(W + '/agg5.json'))
tiers = {str(t): [] for t in range(1, 7)}
for x in out: tiers[x['tier']].append(x['id'])
stats = {x['id']: {'r5': round(x['r5'], 3), 'n5': x['n5'], 'sh5': round(x['sh5'], 3)} for x in out}
p = 'index.html'; s = open(p, encoding='utf-8').read()
i = s.index('const TIER_HISTORY = ') + len('const TIER_HISTORY = '); j = s.index('\n', i)
body = s[i:j]; semi = body.endswith(';'); d = json.loads(body.rstrip(';')); d.pop(ver, None)
nd = {ver: {'scale': 6, 'date': date, 'tiers': tiers, 'note': f'{len(out)}기 · A랭크 기준 · 5:5 {games:,}판 시뮬 (1:1 · 3:3 제외)', 'stats': stats}}; nd.update(d)
s = s[:i] + json.dumps(nd, ensure_ascii=False, separators=(',', ':')) + (';' if semi else '') + s[j:]
a = s.index('const BOT_TIER_LIST = {'); b = s.index('\n};', a) + 3
lines = [f'const BOT_TIER_LIST = {{ // {ver} 티어표 (5:5 시뮬 · A랭크 기준)'] + [f"  '{t}': [{', '.join(repr(x) for x in tiers[t])}]," for t in '123456'] + ["  '?': []", '};']
s = s[:a] + '\n'.join(lines) + s[b:]
open(p, 'w', encoding='utf-8').write(s)
print('applied', ver, {t: len(v) for t, v in tiers.items()})
