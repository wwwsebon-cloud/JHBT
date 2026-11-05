#!/usr/bin/env bash
# 티어 시뮬 한 번에 (R2.22.2 · R1 tools/tierlist/run.sh 를 R2 에 맞게): 로컬 서버 → 병렬 일꾼 → 집계 → 반영 → 티어표 인포그래픽
# 사용법: tools/tierlist/run.sh <버전> [판수=1600] [병렬=4] [부트스트랩=100]
#   작업 폴더 TIER_WORK (기본 /tmp/jhbt-tier-<버전>) 에 판이 남아 있으면 이어서 돌린다 (판 수를 늘리면 뒤에만 더)
#   CHROME (shot.py 용 크롬 경로 · 기본 /opt/pw-browsers/chromium) · 반영하지 않으려면 NO_APPLY=1
set -e
VER=$1; GAMES=${2:-1600}; N=${3:-4}; BOOT=${4:-100}
[ -z "$VER" ] && { echo "사용법: $0 <버전> [판수] [병렬] [부트스트랩]"; exit 1; }
ROOT=$(cd "$(dirname "$0")/../.." && pwd); cd "$ROOT"
W=${TIER_WORK:-/tmp/jhbt-tier-$VER}; mkdir -p "$W"
if ! curl -s -o /dev/null http://127.0.0.1:8766/index.html; then python3 -m http.server 8766 >/dev/null 2>&1 & SRV=$!; sleep 1; fi
trap '[ -n "$SRV" ] && kill $SRV 2>/dev/null' EXIT
T0=$(date +%s)
PIDS=""; for i in $(seq 0 $((N - 1))); do node tools/tierlist/run.js "$W" $i $N $GAMES & PIDS="$PIDS $!"; done; wait $PIDS # 서버는 기다리지 않는다
echo "시뮬 $(( $(date +%s) - T0 ))초"
node tools/tierlist/agg.js "$W" "$BOOT"
[ -n "$NO_APPLY" ] && exit 0
python3 tools/tierlist/apply.py "$W" "$VER" "$(date +%Y.%m.%d)"
python3 infographics/make.py "infographics/tier-$VER.json"
CHROME=${CHROME:-/opt/pw-browsers/chromium} python3 infographics/shot.py "infographics/tier-$VER.html"
