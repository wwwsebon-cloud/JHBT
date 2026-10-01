#!/usr/bin/env bash
# 빠른 티어리스트: 5:5만 · A랭크(랭크 효과 없음) · 기본 1,600판을 4개로 나눠 병렬 (약 5~8분)
# 사용법: tools/tierlist/run.sh <버전> [판수=1600] [병렬=4]
set -e
VER=$1; GAMES=${2:-1600}; N=${3:-4}
W=${TIER_WORK:-/tmp/jhbt-tier}; mkdir -p "$W"; rm -f "$W"/t5_*.jsonl
ROOT=$(cd "$(dirname "$0")/../.." && pwd); cd "$ROOT"
python3 - "$W" <<'PY'
import sys
s = open('index.html', encoding='utf-8').read(); h = open('tools/tierlist/harness.js', encoding='utf-8').read()
a = 'window.__PHYS = PHYS;'; assert s.count(a) == 1
open(sys.argv[1] + '/sim.html', 'w', encoding='utf-8').write(s.replace(a, a + '\nwindow.__t = { state, get profile() { return profile; } };\n' + h))
PY
for i in $(seq 0 $((N - 1))); do node tools/tierlist/run.js "$W" $i $N $GAMES & done; wait
node tools/tierlist/agg.js "$W" | tee "$W/result.txt"
python3 tools/tierlist/apply.py "$W" "$VER" "$(date +%Y.%m.%d)" "$GAMES"
