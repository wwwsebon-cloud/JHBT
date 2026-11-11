# RE : 지후배틀 (RE:JHBT) — 작업 규칙

## 꼭 지킬 것
1. **한국어를 쓴다** — 대답 · 코드 주석 · 커밋 메시지 · 패치노트 모두.
2. **작업 전에 이 파일을 꼭 읽는다.** 함수 이름 · 예전 수치 · 연혁이 필요하면 `docs/CLAUDE-history.md` (R2.18 까지의 자세한 기록)에서 필요한 부분만 검색해서 본다.
3. **작업이 끝나면 디스코드 공지용 인포그래픽을 꼭 만든다** (아래 「인포그래픽」).
4. **신규 지후가 나오면 신규 지후 인포그래픽도 만든다. 서사(`story`)가 없으면 서사도 쓴다** (아래 「신규 지후」).
5. 기본적으로 **main 에 머지까지** 한다 (작업 브랜치 → 커밋 → main 에 머지 → 푸시). 푸시는 사용자 터미널에서.
6. 테스트할 때 실서버 Firebase 에 테스트 계정을 만들거나 로그인하지 않는다. 실제 계정 데이터를 건드리지 않는다 (`?bench=` · 로컬 프로필 · 헤드리스는 Firebase 주소를 막고).
7. 올리기 전에 빈 브라우저로 첫 로딩을 확인한다 (오류 없이 로비까지).
8. **브라우저로 테스트할 때는 반드시 소리를 끈다** (사용자 요청 · 시끄럽다): 페이지를 열자마자 `localStorage` 의 `rejhbt-sfx-vol` · `rejhbt-bgm-vol` 을 `'0'` 으로 두고 새로고침 (효과음 볼륨은 켤 때만 읽는다) · 헤드리스 크롬은 `--mute-audio`.
9. **⚠️ 주석은 각별히 조심한다 (여러 번 사고남)** — 한 줄에 코드가 길게 이어지는 곳 (`u2Vals` 의 값 객체 · 한 줄 함수 · 템플릿 문자열) 에서 `// 설명` 을 줄 중간에 넣으면 **그 뒤 코드가 통째로 주석이 되어 조용히 사라진다** (오류도 안 난다). 예: R2.26 「1랭크 기준」 주석이 지후 상세의 `heroH` · `picD` 를 삼켜 초상화 · 이름이 사라졌고, R2.27 build 2 에서도 `u2FanFit` 의 `if` 를 삼켰다.
   - 줄 중간 · 코드 앞에는 **반드시 `/* … */`** 만 쓴다. `//` 는 그 줄의 **진짜 맨 끝**에만.
   - 기존 줄 끝 `//` 주석 뒤에 코드를 덧붙이지 않는다 (덧붙일 땐 주석을 `/* */` 로 바꾸거나 줄을 나눈다).
   - 수정 뒤 **`python tools/comment-check.py`** 를 꼭 돌려 「의심 0줄」을 확인한다.

## 이름 · 버전 · 구조
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT** · 지금 **R2.35** (build 3).
- **⚠️ 버전은 하루에 한 번만 올린다 (R2.35 · 2026-11-11 사용자 요청 · 버전을 너무 많이 올렸다)**: 그날 첫 업데이트에 둘째 자리 +1 (R2.35 → R2.36) · 같은 날 이어지는 패치는 버전 그대로 `jihoo-build` +1 (특별한 경우가 아니면 셋째 자리 R2.xx.1 도 쓰지 않는다). 패치노트는 그날 항목 하나에 `추가 패치 (build N)` 칸을 맨 위에 더하고 (title 은 그날 내용을 아우르게 고친다) · 인포그래픽은 `<버전>-bN` · 하루가 끝날 무렵엔 `today-<날짜>.json` 총정리 (예: `today-2026-11-11` · 새 모드는 최종 상태로 · 밸런스는 `balance-sum.js` 결과에서 고친 타일).
- 버전은 `<meta name="jihoo-version">` (이름은 R1 과 같아야 한다 · 예전 화면이 새로고침 안내를 띄움). 버전 그대로인 잠수함 패치는 `<meta name="jihoo-build">` +1.
- `index.html` 하나가 게임 전체 (빌드 없음). 로컬 테스트: `python -m http.server 8766` → `index.html?bench=` (로그인 없이 · 테스트 함수는 `window.__rejhbt`).
- `firestore.rules` 는 R2 전체 규칙 · 콘솔에는 파일 전체를 게시 (사용자가 직접).
- R1 (v8.1) 코드는 `archive/v8.1` 브랜치.
- **사이트 배포 (GitHub Pages)**: `_config.yml` 의 `exclude` 로 게임에 안 쓰는 폴더 (인포그래픽 · tools · docs · app · 지후초상화 …) 를 뺀다 — 배포물이 225MB (그중 인포그래픽 204MB) 가 되자 Pages 배포가 10분 제한을 넘겨 실패했다 (R2.28 · R2.30). 큰 폴더를 새로 올리면 여기에 더한다. 배포 상태: `https://api.github.com/repos/wwwsebon-cloud/JHBT/actions/runs` · 사이트 버전 `curl jihoobattle.kr` 의 `jihoo-version`. **작업이 끝나면 `main` 으로 돌아와 둔다** (작업 브랜치에서 사용자가 `git push` 하면 upstream 없음 오류).

## 업데이트 때 할 일
1. `index.html` 수정 — `CHARS` 수치와 함께 `passive` · `skill.desc` · `atkText` · `CHAR_INFO` (도감 상세) · 팁 (`TIPS_MORE` · `BOOT_TIPS`) 에 적힌 숫자도 같이.
2. 버전 / build 메타.
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new · buff · nerf · adjust · rework · fix · system).
4. 인포그래픽 (아래).
5. 이 파일에 바뀐 규칙이 있으면 짧게 갱신 (긴 연혁은 적지 않는다).

## 인포그래픽 (저장소 `infographics/`)
- 로컬 서버를 켠 뒤: `node infographics/extract.js` → `node infographics/notes2json.js <버전>` → `python infographics/make.py infographics/<버전>.json` → `CHROME=<크롬 경로> python infographics/shot.py "infographics/<버전>*.html"`.
- 레이아웃은 늘 최신 **남색 · 타일** (R2.20 부터 · `notes2json.js` `TILE_MIN` 1 · `theme: 'dark'`) — 밸런스 지후는 5칸 타일 (많으면 여러 장 `<버전>-2.png` …) · **R2.22.1 타일 개편**: 변경 하나 = 타일 하나 (같은 지후는 연달아 · `split_tiles`) · 단색 (상향 `--tb` · 조정 `--ta` · 하향 `--tn`) · 글꼴 **Lilita One (숫자 · 영문) + Do Hyeon (한글)** (사용자가 고름) + 검은 외곽선 · 한 줄 4칸 · 높이 모두 같게 · 색은 지후 태그 (조정 지후만 수치 방향 `line_dir`). 타일 글자가 넘치면 패치노트 문구를 짧게 (예: 「[최후의 탄환] 체력 손실 16% → 19%」).
- **신규 지후**: `node infographics/notes2json.js <버전> --new` (그 버전 패치노트의 tag 'new' 지후 · 직접 고르려면 id 를 뒤에) → make.py · shot.py.
- **인포그래픽 안에 게임 스크린샷을 넣지 않는다** (R2.29 사용자 요청 · make.py 의 `"shots"` 칸은 쓰지 않는다 · 눈으로 보이는 변화도 글 타일로만). 리눅스(클라우드)에서는 `CHROME` 에 `--no-sandbox` 를 붙인 래퍼를 준다 (extract.js).
- 여러 버전 밸런스 총정리: `node infographics/balance-sum.js <처음 버전> <마지막 버전>` (지후별 처음 → 지금 · 랭크 6 제외 · 지저분하게 합쳐지는 지후는 파일 안 `OVERRIDE`) → `balance-<처음>-<마지막>.json` → make.py · shot.py.
- 티어표: make.py `"type": "tierlist"` · `infographics/tier-<버전>.json` (시뮬 결과로).
- 새 지후는 make.py 의 `NAMES` 와 `infographics/portraits.json` 에도 넣는다.
- 만든 PNG 는 커밋하고 사용자에게 보낸다.

## 신규 지후 체크리스트
- 초상화: **흰 배경 256×256 PNG** (투명 금지) → `PORTRAITS` (base64) · 원본은 `지후초상화/` 또는 사용자가 준 폴더.
- **시그니처 색 (R2.28)**: 초상화를 넣은 뒤 **`python tools/sig-color.py --sheet <확인표.png>`** → `SIG_C` 한 줄이 갱신된다 · 확인표를 **눈으로 꼭 보고** 그 지후 색과 다르면 (몸은 회색인데 작은 소품 색이 뽑힘 · 연한 색연필이 회색으로 · 두 색인데 한 색) 파일 안 `SIG_FIX` 에 `'id': '#색'` 또는 두 색 `'#색1,#색2'` 를 적고 다시 돌린다.
- `CHARS` 끝에 추가 (도우미 함수는 `reapFx` 바로 앞 `// ── R2.xx 신규 지후 도우미 ──`). 사용자가 안 준 역할군 · 사거리 등은 정하고 알린다.
- `passive` · `skill.desc` 는 **쉽게 · 존댓말 ~니다 · 한두 문장** (중요한 숫자만 · 조건 · 예외 · 세부 수치는 넣지 않는다 · 예: 황사 · 슬라임 지후) · 자세한 숫자는 `CHAR_INFO[id]`.
- **서사 `story`**: ~입니다 · ~해요 체 · 5~7문장 · **개그 · 병맛 톤** (외양 묘사는 줄이고, 말도 안 되는 사건 · 반전 · 마지막 한 줄 펀치라인) · 지후왕국 세계관과 다른 지후를 엮는다 (아래 「세계관」 · 기존 연결을 깨지 않게). **R2.30 build 3 글 오버홀 규칙 (AI 티가 나는 것들 · 사용자 요청)**:
  - **인용문을 넣지 않는다** (「…」 · "…" 대사 금지 · 말한 내용은 서술로 풀어 쓴다).
  - **실제 능력과 관련된 숫자를 넣지 않는다** (초 · % · 횟수 · 발 수 · 체력 등 · 한글로 쓴 숫자도). 세계관 숫자 (1호 · 314호 · 3년 등) 는 괜찮다.
  - **능력 서술은 최소한** (능력은 passive · CHAR_INFO 가 말한다 · 서사는 이야기).
  - 밸런스로 바뀌면 핑계를 넣어도 되지만 숫자 없이 (예: 근위대 예산이 깎여 총알이 싸구려가 됐다).
- **도감 상세 `CHAR_INFO`**: 버전명 (R2.x · build) 을 쓰지 않는다 · 예전에 비해 바뀐 것을 쓰지 않는다 (지금 규칙만) · 불필요한 서술 (~이 아니라 · 없음 · 하지 않음 같은 부정 설명은 꼭 필요할 때만) 은 뺀다. 버전 기록은 코드 주석 · 패치노트에만.
- 뽑기 · 덱 · 도감에 안 나오는 변신 지후 (왕자 지후 `prince`) 는 `Object.defineProperty(CHARS, id, { enumerable: false })` — `Object.keys(CHARS)` 에는 없고 `CHARS[id]` 로는 찾는다 (배치 기록 · 친선전 · 이름 표시가 그대로 돈다).
- 새 상태 · 버프는 `STATUS` · `FX_OF` / `fxList` (효과 아이콘) · `BUFF_SRC` (버프 출처 이름).
- 배치 기록에 새 필드를 넣으면 친선전 `packPlace` 에도.
- `TIER_SC` 에 없으면 50 (B) 으로 본다 → 티어 시뮬 뒤 넣는다.
- 헤드리스로 전투 테스트 (오류 · 이펙트가 남지 않는지 · 스크린샷).
- **렉이 거의 없게 만든다 — 유닛 50기 이상에서도 프레임 드랍이 전혀 없어야 한다** (아래 「성능 규칙」 · 벤치로 확인).

## 성능 규칙 (새 지후 · 새 이펙트)
- 전투 중 **화면이 다시 그려지는 일 (레이아웃 · 리페인트)을 최소로**: 이펙트는 `transform` · `opacity` 애니메이션만 (`box-shadow` · `filter` · `border-color` · `background` · `width` 를 애니메이션하지 않는다 · 큰 반투명 그라데이션 원을 매번 새로 만들지 않는다).
- CSS 에 `[style*=…]` 같은 **style 속성 선택자를 쓰지 않는다** — 하나만 있어도 전투 중 인라인 style (위치 · 체력바) 이 바뀔 때마다 자식 요소를 모두 다시 계산한다 (R2.18 build 5 · 새 로비 그리드는 `U2_GRID_TAG` 가 붙이는 클래스 `u2-gr` 로). 쓰러진 유닛은 효과 아이콘 줄 `ufxOf` 을 다시 만들지 않는다.
- DOM 위치 · 크기는 프레임마다 한 번 이하로 (`tick` 은 한 프레임에 여러 번 돈다 · 그리기는 바뀐 값만 · `translate` 로).
- 매 스텝 `A.status` · `A.buff` 를 다시 걸지 않는다 (걸 때마다 `drawUnit` → 상태 아이콘을 다시 그린다) — 이미 걸려 있으면 남은 시간만 늘린다.
- 이펙트 DOM 은 `S.fast` 일 때 만들지 않고, 끝나면 꼭 지운다 (`u.fx` 에 넣으면 쓰러질 때 · 라운드 끝에 지워진다). **R2.29 부터 자주 생기는 이펙트는 `CV.on` 이면 전장 캔버스 (`CVF`)** — 아래 「최근 변경」.
- 여러 유닛을 잇는 선 · 빛줄기는 유닛마다 DOM 을 만들지 않는다 → 전장 캔버스 하나에 프레임마다 한 번 (모노리스 `monoDraw` · R2.20 · DOM 으로는 50기 벤치 FPS 46 → 36).
- **큰 원 · 긴 빛줄기도 DOM 으로 만들지 않는다** — 반경 15칸 원 (지름 2,250px) · 대각선 레이저는 폰 GPU 에 거대한 레이어가 된다 (헤드리스로는 안 보인다) → `fxRing(x, y, R, 색, ms, 테두리)` · `FXC.beams` (monoDraw 캔버스 · R2.20 build 3 DJ · 모노리스).
- 넓은 범위 스킬 피해 숫자는 `dealDamage(..., { skill: true, lite: true })` (처음 몇 개만 크게) — 스킬 피해 숫자는 원래 한도(FX_CAP)를 무시한다.
- 전장 격자는 `#fieldGrid` 를 transform 으로만 옮긴다 (`applyCamera`) — fieldWrap 의 background-position 을 매 프레임 바꾸면 화면 전체를 다시 그린다.
- 확인: `?bench=50&ids=<지후,…>` (왼쪽 위 FPS · 최악 프레임 · 계산 ms) · 헤드리스 `Performance.getMetrics` 의 RecalcStyle · Layout 횟수를 다른 지후와 비교.

## 전투 엔진 핵심
- 전투 난수는 `rng` 하나만 (친선전 두 화면이 같아야 한다) · 전투 코드에 `Math.random` · `Date.now` 금지. 연출 · 뽑기는 `Math.random`.
- 스킬 도우미 `A` (`A.dmg` %피해 · `A.status` · `A.buff` · `A.line` 관통탄 · `A.zone` · `A.boom` · `A.knock` · `A.later` 전투 시간 예약 · `A.transform` · `A.summon` · `A.spawnChild`). 훅: `onStart` · `tick` · `customAttack` · `onHit` · `onKill` · `onUnitDeath` · `steer` · `takenMult` · `atkMult` · `pickTarget` · `gauge`.
- 즉사는 `instaKill(src, t, label)` 하나로 (모든 생존기 무시). 피해는 `dealDamage` (받는 피해 감소 최대 90% · 최소 1 · 죽인 쪽 `t.killer`).
- 투사체 `S.shots` · 관통탄 `S.lines` 는 맞는 순간 새로 쏜 것도 남도록 목록을 비우고 돈다 (R2.18 수정 · 다시 `filter` 한 번으로 바꾸지 말 것).
- 전투 중 `drawUnit` 은 모았다가 프레임마다 한 번 그린다. 화면 효과 DOM 은 `S.fast` (시뮬) 일 때 만들지 않는다.
- 전장: 세로 17 × 24칸 (`CFG.CELL`) · 라운드 60초 · 배치 3 × 5칸 · 같은 지후 제한 없음 (R2.34 · 출격제한 `deployLimit` ≤ 2 지후는 넘으면 패시브 · 스킬 없음) · 레벨은 경기 안에서만 (최대 Lv5 · 갓지후 Lv6 · 레벨마다 체력 · 공격력 기본의 +60% `CFG.LEVEL_ADD` · R2.19).

## 게임 규칙 요약
- 모드: 일반전 (봇 · 라이프 3) · 친선전 (온라인 1:1) · 아케이드 (미러전 · 지후의 탑 · 경쟁전) · 샌드박스. **이벤트 모드** (R2.23 · 일반전만 · 로비 토글 `profile.mode` · `CFG.EV_ENABLED`) — 아래 「최근 변경」.
- 덱 5기 · 등급 일반 / 희귀 / 영웅 / 전설 · 뽑기 62.5 / 30 / 5 / 2.5 (`CFG.GACHA` · 새 로비 칩은 여기서) · 천장 80 · 초보자 모집 (R2.20 build 5) · 중복은 조각 · 랭크 (조각 + 골드 · 랭크 6 고유능력 `enh6`).
- 봇 배치 `botDeployOne`: 둘 수도 · 합칠 수도 있으면 페르소나의 합체 확률 `mf` (없으면 **50%** · R2.19) 로 레벨업 · 아니면 새로 놓기. 칸은 `botTile` (R2.21 · 왕초보는 예전 `pickTile`): 인접 가치 `adjScore` (십자 버프 `ADJ_BUFF` 가속 · 보호막 · 수호자 · 소믈리에(2명 이상 · 1명은 0.6) · 엑시노스 / 고독한 지후 8칸이 비면 +4) 오름 × 1.2 − 원하는 줄과의 거리 − 가운데에서 먼 만큼 × 0.15 + 무작위 0.4 · 자리 바꾸기 페르소나도 인접 가치가 내려가면 안 바꾼다. 새 인접 지후를 만들면 `ADJ_BUFF` 에도.
- 배속 (R2.19): 전투 화면 동그란 버튼 `#speedSeg` 하나 · 누구나 1.5배속 · VIP 는 2배속 (`fastSpeed`) · 꺼 두어도 25초 뒤 자동 1.5배속.
- 봇: 초보자 보호 (5판 · 봇 ×0.75) → Lv.5~10 사이 봇 덱이 서서히 강해진다 (`botDeckRamp` · `TIER_SC`).
- 화면: 새 로비 `#ui2` (어두운 남색 디자인 · 템플릿 `ui2Tpl` · `u2Vals` / `u2Render`). 새 CSS 는 `u2-` 접두사.

## 세계관 (서사를 쓸 때)
- 지후들이 사는 **지후왕국**. 국왕 **화염 지후 1호** · 오른팔 **물 지후**. 같은 종류도 1호 · 2호 … 여럿.
- 메인 스토리: 황사 지후의 「황사회주의」 지령으로 서쪽 마을 **화염 지후 314호**가 반란 → 소탕군 지원자는 암살 · 쉴드 · 검 · 얼음 넷뿐.
- 자주 쓰는 연결: 왕궁 (근위대장 수호자 · 의원 주사 · 금고 티타늄 · 시계방 시계 · 천문대 별) · 블리자드 ↔ 태양 · 얼음 ↔ 블리자드 (펜팔) · 촉수 ↔ 죠스 · 라이플의 러시안룰렛 트라우마 · 포식이 남의 음식을 먹어 치움 · 조커가 슬롯머신을 털었음.
- 지후마다 자세한 서사 연결은 `docs/CLAUDE-history.md` 의 「세계관 · 서사」와 각 버전 서사 항목.

## 시뮬 · 티어
- **`tools/tierlist/run.sh <버전> [판수=1600] [병렬=4] [부트스트랩=100]`** (R2.22.2 · R1 `archive/v8.1` 의 tools/tierlist 방식을 옮기고 강화 · 자세한 건 `tools/tierlist/README.md`): 무작위 10기 5:5 · Lv1 · 60초 판정 · 결과 점수 (남은 체력 차이) · Bradley-Terry · k-평균 S~D · **진영 바꿔 두 번 · 고르게 뽑기 · 판마다 jsonl (이어서 돌리기) · 부트스트랩 안정도 (60% 아래 경계) · 지난 TIER_SC 와 비교 ▲▼** → `apply.py` 가 `TIER_SC` · `infographics/tier-<버전>.json` · `tools/tierlist/history/` 를 쓴다 → make.py · shot.py 까지. 클라우드 4코어에서 1,600판 약 11분. 지금 `TIER_SC` · `infographics/tier-R2.26` 은 R2.26 코드 · 1,600판 (일꾼 2개 · 괴도 예고장 16초 반영) · 예전: tier-R2.25.4 는 R2.25.4 코드 · 1,258판 (1,600판 중 · 로컬 윈도우에서 일꾼 12개가 PC 를 멈출 만큼 무거워 중간에 끊고 그대로 집계 · **로컬에서는 일꾼 1~2개로**). (예전 콘솔용 `tools/tier-5v5.js` 도 남겨 둠)
- 로컬 윈도우: playwright 없음 → `node tools/tierlist/run-cdp.js <폴더> <번호> <일꾼 수> <판수>` 를 일꾼 수만큼 띄운 뒤 `node tools/tierlist/agg.js <폴더> 100` → `python tools/tierlist/apply.py <폴더> <버전> <날짜>`.
- 결과로 `TIER_SC` (**SS 90~100** · S 80~89 · A 65~79 · B 40~64 · C 20~39 · D 0~19 · R2.26 부터 6티어 — 지후 100종이 넘어서) 를 갱신한다 · 게임 `tierOf` · `TIER_C` · 도움말 티어리스트 · make.py `.tr.SS` 도 SS ~ D.
- 메커니즘을 바꾸는 중에 돌린 시뮬은 무효 — 마지막 코드로 다시 돌린다.

## 계정 · 서버 (짧게)
- Firebase 프로젝트 `jihoobattle` · 게스트는 익명 인증 · 기록 `r2_backups/<uid>` · 이 기기 `rejhbt.profile.v1`.
- **켤 때 서버 기록과 맞추기 (R2.18 build 6)**: 저장 시각(`savedAt`)은 켜는 동안 `save()` 가 바꿔 버리니 비교에 쓰지 않는다 — 백업마다 기록 안에 저장 번호 `profile.bkWid` 를 넣고, 이 기기는 마지막으로 맞춘 번호 `profile.syncWid` 를 기억 → `serverNewer(b)`: 번호가 다르면 서버 기록 · 번호가 없으면 진행도(레벨 → 경험치 → 판 수) 앞선 쪽. 서버 규칙(`r2_backups` 는 payload · savedAt · updatedAt 만)을 안 바꾸려고 번호는 payload 안에.
- **백업 강화 (R2.20 build 3)**: `backupNow` 는 이 창이 BK_TRUST(60초) 안에 저장 · 확인하지 않았으면 `runTransaction` 으로 서버 `bkWid` 가 `profile.syncWid` 와 같을 때만 쓴다 (다르면 `bkConflict` → `bkPick`: 진행도 `bkSum` 이 한쪽이 모두 같거나 앞서면 그쪽 · 엇갈리면 묻는다). 숨었다 돌아옴 · 잠들었다 깸 · 다른 탭이 기록을 바꿈 → `ACC.vAt = 0`. 멈춘 창(`ACC.kicked`)은 `writeLocal` 도 안 한다. 다시 로그인해도 이 계정 기록이면 비교 (예전엔 서버로 무조건). 게스트 진행이 있으면 로그인 전에 `guestLoginOk`. 서버 이력 `r2_backups/<uid>/hist/{t0~t7 · x0~x3}` (3시간마다 · 버린 기록) → 운영 도구 「보기」가 지금 없는 지후를 보여 준다 (rules 게시 필요). 상태는 `bkState` · 메뉴 점 `bkWarn`.
- 계정 창: 햄버거 → **JHBT 계정** (`#accModal` · `renderAccount` · `openAccount(tab)`) · 환경설정 맨 위는 요약 한 줄 (`renderSetAcc`) · 튜토리얼 `#tutAcc` · 닉네임 단계 `#nsAcc` 「이미 계정이 있나요?」 (로그인하면 `TUT.abort`). 가입 보상 `joinReward` = **선택 전설 모집권** (`signRw` 로 계정당 한 번).
- `dlg` 가 다른 dlg 에 밀리면 `null` (예전 false) — 꼭 골라야 하는 창은 null 이면 다시 묻는다.
- 운영 우편 `giftMail` 보상: ◆ · ● · 랜덤 영웅/전설 · **정해진 지후** `{ kind: 'char', id, amount }` (R2.20 build 2 · 운영 도구 「지후」 칸에 이름) · 이 버전이 모르는 보상이 든 우편은 받은 것으로 치지 않고 남겨 둔다 (`giftOk`).
- 운영자 `admins/<uid>` · 정지 `bans/<uid>` · 점검 `config/maintenance` · 공지 `config/announce` · 욕설 검사 `hasBad` (금지어를 늘리면 rules 의 `cleanName` 도).
- 프로필 정규화가 보는 데이터 (`ITEMS` · `FRAMES` · `MQ`) 는 `let profile = loadProfile()` 보다 앞에.

## 안드로이드 앱 (APK · R2.26 부터)
- **Capacitor 7** · `app/` (패키지 `kr.jihoobattle.app` · 바꿀 수 없음) · 게임 파일을 **APK 안에** 넣는다 (사용자가 고름 · 사이트를 감싸는 TWA 아님) → 업데이트마다 새 APK.
- 만들기: `cd app` → `npm run sync` (`tools/app-sync.js` 가 index.html · manifest · icons · sfx · bgm · comic · emo · r1jihoo 를 `app/www` 로 복사 + `cap sync`) → `cd android` → `JAVA_HOME=<JDK 21> ./gradlew.bat assembleRelease` → `app/android/app/build/outputs/apk/release/app-release.apk`.
- **새 APK 마다 `app/android/app/build.gradle` 의 `versionCode` +1 · `versionName` = 게임 버전** (낮으면 폰이 업데이트로 받지 않는다).
- 도구 (저장소 밖 · 관리자 권한 없이): JDK 21 `C:/Users/User/AppData/Local/jhbt-android/jdk` · Android SDK 35 `…/jhbt-android/sdk` (`android/local.properties` 의 `sdk.dir`).
- **서명 키** `C:/Users/User/Documents/jhbt-app/jhbt-release.jks` + `keystore.properties` (비밀번호 · `app/android/keystore.properties` 로 복사해 쓴다 · git 에 안 올림) — **잃어버리면 같은 앱으로 업데이트를 못 낸다** (유저가 지우고 다시 설치해야 함).
- 게임 안 `IS_APP` (Capacitor 네이티브): 서비스 워커 없음 · 새 버전 확인은 `APP_SITE` (jihoobattle.kr) 의 meta 와 비교 → 업데이트 창이 「새 APK 받기」(`CFG.APP_DL`) · 「나중에」 · 구글 로그인 막음 (구글이 앱 안 로그인 창을 막는다 → UID · 비밀번호) · `appStandalone()` 참 · 안드로이드 뒤로 가기 (`@capacitor/app` · 창 → 모달 → u2 시트 → 로비 탭 → 끌까요?) · 웹 푸시는 앱 WebView 에 없다 (앱 알림은 나중에 네이티브 FCM 으로).
- 앱의 저장 (localStorage) 은 브라우저와 따로 — 계정으로 로그인하면 서버 기록과 맞춘다.

## 최근 변경 (R2.35 · 밸런스 8종)
- 부루스타 ATK 225 · 공격력 선형 감소 (`atkMult` 1 − t/15) · `splash` 1.9 · 꺼짐 7초 · 차원 ATK 140 · 늑대 스킬 [포효] `wolfRoar` (SP 6 · 반경 2칸 넉백 2.5칸 · buff `wroar` 공격력 −15% 5초) · 불사조 쉴드 400 · 블랙홀 ATK 100 · 홍명보 패스 회복 40% · 빔 ATK 25 · 사거리 5.3 · 죠스 공격 회복 30%. 티어 시뮬은 돌리지 않았다 (사용자 요청).
- **build 2 디펜스 광폭 웨이브**: 적 배율 `dfKw(w)` = 직선 (`K0 + (w − 1) × KADD`) × `dfExp(w)` (`DF.EXP_W` 30 웨이브 뒤 웨이브마다 `EXP_R` 1.035 곱 · 반복 곱셈) — 직선만이면 포식 · 합체처럼 계속 커지는 덱이 끝나지 않았다 (라이플만으로 141웨이브). 50웨이브 2.4 · 100웨이브 19.9 · 141웨이브 104배. HUD `oddsLabE` 에 `🔥×M` · 31웨이브 배너. 스택 한도는 사용자가 원하지 않는다.
- **build 3**: 부활 지후는 부활 지후를 되살리지 않는다 (`onUnitDeath` 에서 revL 에 안 넣음 · SP 는 그대로 · 모든 모드 — 부활끼리 서로 되살리는 연쇄로 디펜스에서 아군이 500기를 넘었다) · 성뿌수기 · 디펜스는 `cwFull(side)` (소환체 포함 살아 있는 지후 ≥ `CW.CAP` 40) 이면 `A.spawnChild` (전장에 없는 쓰러진 사본을 돌려준다 · 부르는 쪽이 c 를 쓴다) · 부활 · 반중력 분열을 막는다. 새 소환 경로를 만들면 `cwFull` 을 본다.

## 최근 변경 (R2.34 · 디펜스 모드 · 출격제한 개편 · 연출)
- **출격제한 개편**: `canPlaceNew` 는 같은 지후 수를 보지 않는다 (`CFG.SAME_LIMIT` Infinity · `limitOf` 는 deployLimit 또는 Infinity) · `overSet(L)` = deployLimit ≤ 2 지후의 초과 칸 (레벨 높은 순 → 칸 번호 순으로 제한 안 · 조커가 변한 지후는 조커로 · 이벤트 'b' 제외) → 전투 시작 (`S._ov` · `cwSpawn`) 에 `ovlUnit` = `plainDef` (함수 훅 · skill 을 뺀 def · atkText 만 남김) · 배치 화면 · 슬롯판은 회색 `.ovl` · 봇은 `botPlace` 로 넘기지 않는다 · 내가 넘기면 배너 경고.
- **디펜스 모드** (`arc.kind 'defense'` · 성뿌수기 틀 재사용 `isCw()` · `S.cw.df` · 상수 `DF`): 로비 일반전 오른쪽 버튼 → 모드 로비 `K_MODE.defense` (`isMDef` · 열쇠 상자) → `dfGo` (무료). 내 슬롯 출격 `dfWave` 20초 (`c.t` · 골드 `cwIncome(c.mw)`) · 적 웨이브 `dfFoeWave` 10초 (`c.et` · 적을 다 잡으면 바로 · `dfSpawn` 무작위 지후 `dfPool` Lv1 · 수 3 + 0.3 × (웨이브 − 1) · 능력치 ×(0.7 + 0.04 × (웨이브 − 1)) · `u.dfE`) · 노릴 아군이 없으면 `dfMarch` (aiSteerAndAttack) · 내 진영 끝 `dfAtEnd` → `dfLeak` 라이프 −1 (10) · 끝 `dfEnd` 열쇠 = 웨이브 − 1 · 최고 웨이브 `profile.dfBest` → `dfPush` (`r2def` · **firestore.rules 게시 필요**) · 핵 지후는 고정 `DF.NUKE` 500 · PC (900px `DF_SPLIT`) 는 `#screen-battle.cw.df` 왼쪽 트레이 380px · 오른쪽 전장 (`viewInsets` 아래 가림 0).
- **build 11**: 폰에서 다른 탭에 다녀오면 전투가 깜빡이던 것 — 화면이 다시 보이면 (`visibilitychange` · `pageshow` · 캔버스 `contextlost/restored`) `cvReset` 이 캔버스 · 그림 캐시 (`CV.spr` · `u._cvB/_cvI`) 를 버리고 새로 · ResizeObserver 는 전투 중 따라가는 카메라면 `fitCamera` 로 튀지 않는다. + `animReset` (돌아오면 무한 반복 애니메이션 `getAnimations` 을 cancel → play · R1 7.1.2 「다른 앱 · 탭에 다녀오면 배경 애니메이션을 새로 만든다」 와 같은 고전 버그). 헤드리스로는 재현이 안 됐다 (폰 확인 필요).
- **build 10** (디펜스만): `QCAP` 다시 20 · 웨이브가 끝날 때 (`dfFoeWave`) `dfRelReset` = 고고학자 유물 `S.rel` · 클로버 · 랭크 6 · 유물 쉴드 (`u.relSh`) · 토템 · 가호 초기화 · 엑시노스가 쓰러지면 `gpuDrop` (칩 `a.gpu.by`).
- **build 9**: 충격파 기준 `DF.QCAP` 20 → 30 (위 게이지 n/30).
- **build 8**: 내 출격 `dfWave` 는 이제 웨이브 시작 (`dfFoeGo`) 에 적과 같이 (따로 돌던 `c.t` 타이머 없음 · 막대는 `c.et`) · 충격파 판정 `c.qNext` 는 `dfFoeWave` 맨 앞 (이전 웨이브가 끝난 때 · 새 지후 전) — 예전엔 타이머가 어긋나 막 출격한 지후로 바로 터졌다.
- **build 7**: 적 수 = 내 전장 지후 × `DF.NK` 0.6 (+0~1 · 최소 2) · `K0` 0.6 · `KADD` 0.012 · 반격 `dfRally` (`dfRallyCheck` · 라이프 `RALLY` 20 · 10 에서 한 번씩: 🪙 +300 · 전장의 내 쪽 절반에 있는 적 넉백 4칸 · 2000 피해 · 10초 기절) · 사망 이펙트 `spawnDeathEffect` 에 연기 + 해골 (반전 화면은 해골만 되돌림).
- **build 6**: 위 게이지 = 승률 (`allyOdds`) · 라벨 `❤ 라이프 · 👥 아군/20` (`cwHud` · 20 초과면 `.over` 빨강) · 충격파는 3웨이브마다 → 웨이브가 끝날 때 `dfAllies()` > `DF.QCAP` 20 이면 매번 (`dfStep` 이 적 웨이브를 내 출격보다 먼저) · 피해 25% + (웨이브 − 1) × 1%p · `KADD` 0.019.
- **build 5**: 웨이브 골드 ×`DF.GOLD_K` 2 · 처치 골드 ×`KILL_K` 0.5 · 적은 1랭크 고정 (`makeUnit`) · 적 수 = 내 전장 지후 수 ±1 (최소 3 · `dfSpawn`) · `KADD` 0.022 · 충격파는 1초 전 `dfWarn` (.df-warn) 뒤 `A.later(1)` · 피해 `QD0` 25% + 웨이브마다 1%p · 최대 80% · 글 없음. 시뮬은 돌리지 않았다 (사용자 요청).
- **build 4**: 이벤트 다시 10웨이브마다 (`EV_EVERY` 10) · 충격파 `dfQuake` (`dfFoeGo` 끝 · `DF.QUAKE` 3웨이브마다 내 진영 지후 모두 최대 체력 `QDMG` 50% 피해 (자기 자신이 준 dot) · `QSTUN` 5초 기절 · 면역 무시).
- **build 3**: 이벤트 `DF.EV_EVERY` 10 → 5웨이브 · 적 웨이브 `DF.EWAVE` 10 → 20초 (내 출격과 같게). 아래 build 2 의 시뮬 수치 (평균 42웨이브) 는 적 10초 기준이다.
- **build 2**: 라이프 30 · 들어오면 흔들림만 · 난이도 하향 (`DF.NADD` 0.13 · `KADD` 0.016 · 시뮬 `cwBot` 은 디펜스에서 슬롯이 꽉 찼을 때만 합친다 → 기본 덱 자동 봇 평균 42웨이브 · 예전 수치 16) · **디펜스 이벤트** `DF_EV` 39종 (`[아이콘, 이름, 설명, p 게임 내내 | i 바로]`): `DF.EV_EVERY` 10웨이브마다 `dfFoeWave` → `dfPickOpen` (#dfPick · `S.cw.pick` 동안 `loopBody` 가 멈춘다 · 자동 · 빠른 시뮬은 무작위) → `dfTake` → `dfInstant` / `c.evs`. 수치는 `dfStats` → `c.k` → `dfA` · `dfK` (effAtk · aspdRate · 회피 · 치명타 · 받는 피해 · moveToward) · `dfHas` (피의 갈증 · 마력의 힘 · 강약약강 · 멀티샷) · 웨이브 시작 `dfWaveEv` · 출격 `dfMod` · 합체 `dfFused` · `dfCan` (자유합성). 새 디펜스 이벤트는 `DF_EV` + 효과 자리에.
- **열쇠** `profile.keys` · `keyBox()` 🔑 40 = 일반 5 · 희귀 3 · 10% 영웅 · 1% 전설. **성뿌수기는 임시 삭제** (`ARC_MODES` 에서만 뺐다 · 코드 그대로).
- **시작 연출**: `newMatch` 안에서 매칭 창 `mmShow` (#mmOv · 2~4초 · 경쟁전은 자기 매칭 창이 있어 건너뜀) → 인트로 3초 → 전장 로딩 `matchLoading` (#matchLoad · 3초 · 팁) → `startRound` · 튜토리얼 · 샌드박스 · 릴스 · 친선전은 그대로.
- **AUTO 카메라** `CAM.auto` (`rejhbt-cam-auto` · 기본 켬 · 버튼 `#btnCamAuto`): `camFollow` → `camAuto` (교전 중 지후 4기 이상이면 그쪽만 · 위아래 8% 빼고 · 여백 2칸 · 전장 전체 ~ 125% · 10% 안 흔들림 무시). 손으로 옮기면 `CAM.user` → 버튼을 누르면 다시 따라간다. 성뿌수기 · 디펜스도 이제 따라간다.
- 시험 훅 `__rejhbt.keyBox · dfGo · DF · prof()` (`profile` 은 동기화로 바뀌니 `prof()` 로).

## 지난 변경 (R2.33 · 성뿌수기 모드 · R2.33.1 밸런스)
- **R2.33.1**: 성 HP 24,000 · 사거리 6 · 웨이브 30초 (첫 웨이브 10초) · 성의 분노 16,000 · 8,000 = 모든 적 지후 기절 10초 (면역 · 쉴드 무시 · 스테인리스만 버팀 · 골드 +300 그대로) · 합체 `cwFuse` (같은 지후 · 같은 레벨 → 레벨 +1 · **덱의 무작위 지후** · 출격제한 지킴 · 조커 변신은 그대로) · 자리 옮기기 없음 · 입장 무료 (확인 창 없이) · 보상 경험치 `cwXp` (승리 100 · 패배 = 상대 성 피해 비율 × 50 · 항복 0 · 아케이드 포인트 없음) · PC (700px 이상) 는 `#screen-battle.cw:not(.reels)` 폭 520px 가운데 (`:not(.reels)` 는 뒤의 `inset:0` 을 이기려고 · `cwUi(true)` 를 `fitField` 앞에서).
- **성뿌수기** (아케이드 `ARC_MODES.castle` · `arc.kind 'castle'` · 참고: 랜덤다이스 워즈 · 코드 블록 `// ═════════ R2.33 성뿌수기` · 상수 `CW`): 내 덱 vs 봇 덱 (`botDeckRamp('std')`) · `startRound` → `cwStart` (배치 단계 없음 · 리플레이 기록 없음). `S.cw = { gold · cost · wave · t · sd · rage · castle · gone · sel }`.
  - 성 = `SUMMONS.castle` (HP 60,000 · 사거리 3 · ATK 300 / 1초 · `immobile` · `immune` · `noHeal` · `u.big` 큰 몸 `cvD` 150) · `friends()` 에서 뺀다 (아군 버프 · 회복 대상 아님) · `instaKill` 무시 · 체력 비례 피해는 `pctD(t, v)` 로 5% (체력 비례 피해를 새로 만들면 `pctD` 로 감싼다) · 한 번에 최대 체력의 5% 까지 (핵 등) · 왜곡 · 고자 무시 · 슬롯머신 잭팟은 적 지후 전멸 + 성 피해.
  - 웨이브 `cwWave` (20초 `CW.WAVE` · 첫 웨이브 10초 `CW.FIRST` · 골드 `cwIncome` · `cwSpawn` 이 슬롯 `S.place` 의 지후를 칸 자리에 · 진영마다 살아 있는 지후 `CW.CAP` 40기까지 · 유물은 웨이브마다 새로) · 소환 `cwSummon` (10 · +10 · 덱 무작위 · 출격제한은 지킨다) · 합체는 `moveTile` (개구리 · 조커 규칙 그대로) · 성의 분노 `cwRage` (40,000 · 20,000 · 반경 6칸 즉사 · +300) · 처치 +4 (`u.cwU` 웨이브 지후만) · 30웨이브 서든 데스 · 봇 `cwBot` · 끝 `cwEnd` → `endMatch` (아케이드 포인트).
  - `stepCombat` 은 `S.cw` 면 `cwStep` 으로 (전멸 · 60초 · 무피해 판정 없음) · 쓰러진 유닛은 `cwPurge` 가 2.5초 뒤 `S.units` 에서 치운다 (통계는 `gone`) → **`S.units` 의 쓰러진 유닛을 오래 들고 있는 코드는 성뿌수기에서 깨진다** (부활 지후는 `{ id, lv }` 기록이라 괜찮다).
  - 화면: 트레이 `#cwPanel` (웨이브 막대 · 골드 · 소환 · 슬롯판 `#cwGrid`) · `#screen-battle.cw` 가 배치 카드 · 덱 줄 · 안내 칩을 숨긴다 · 위 승률 막대는 성 체력 (`cwHud`) · 타이머 고리는 다음 웨이브 · 로비 모드 화면 `K_MODE.castle` · `isMCastle`.
  - 시험: 빠른 시뮬 양쪽 봇 `S.cw.auto` (스크래치 `cwfuzz.js` · 24판 오류 0) · 빠른 시뮬에서 스파이 `getAnimations` 가 수 초 걸리는 건 화면을 안 그려서 생기는 시뮬 전용 현상.

## 지난 변경 (R2.32 · 밸런스 15종)
- 일반 랭크업 조각 2배 (`ENH_SHARD.common` 합계 2000) · 얼음 사거리 5.5 · 활 HP 1,010 · 보호막 HP 2,040 · 멈춰! HP 2,980 · SP 4 · 촉수 ATK 140 · 랜턴 자가 회복 5 고정 · 마탄 ATK 140 · 빠따 ATK 240 · 신칸센 HP 1,460 · 수은 HP 2,260 · 스파이: 지금 모습과 같은 id 를 치면 치명타 없음 · 불사조 쉴드 350 고정 · 부활 폭발 3칸 · 기상캐스터 ATK 15 · 스테인리스 HP 1,750.
- build 2: 버섯 지후 독버섯 → `mushEat` 이 [침묵] 4초 (독버섯 피해가 끝날 때까지).
- `fxList`: `immune(u)` (쉴드 지후 쉴드) · 보호막 쉴드 (`guardSh`) 가 있으면 [디버프 면역] 아이콘 `pure`.

## 지난 변경 (R2.31 · 한정 등급 · 밸런스 · 전투 화질)
- **한정 등급** `rarity: 'limited'` (한정 · 분홍 `#ff3d7f` · RARITY_ORDER 4 · 랭크 조각은 전설과 같다 · CP 800): 뽑기 (`rollOne` 은 CFG.GACHA 등급만) · 상점 · 봇 덱 · 미러 · 랜덤 · 선물 변신 · 이벤트 지원요청 · 샌드박스 무작위 · 부팅 · 크레딧에 안 나온다 (`pubIds()`) · 미보유자 목록 · 도감 수 · 티어표에서 숨긴다 (`seeId(id)`) · 지후 탭은 보유하면 맨 위에 한정 칸. 주는 방법은 운영 우편 `{ kind: 'char', id }`. 지금 한정: 샌즈.
- 새 등급을 만들면 `RARITY` · `RARITY_ORDER` · `CP_RAR` · `ENH_SHARD` · `RAR_C` · `U2_RAR` · `DOTS` · `SHOP_PRICE` · CSS `.r-<등급>` · make.py `RARITY` 를 같이.
- build 2: 총? 지후 리워크 — [탕!!] 은 피해 없이 `gojaOn` [고자] (이번 라운드 최대 체력 · 체력 1 · 스테인리스 · 무적 · 잠수는 튕겨 냄) + 10칸 넉백 · ATK 0 (도감 —).
- 전장 캔버스 해상도: 기기 배율 그대로 (최대 3 · 저전력 1.5 · 예전 최대 2 라 폰에서 흐렸다) · 그림 캐시 `cvQ` 는 올림 · 50기 ×4 벤치 차이 없음.
- 글자 `dmgNum(u, '…', { stamp: true })` 는 이제 노란 스킬 글씨 (`crit` + `big`) — stamp 의 빨간 CRITICAL 은 숫자 (치명타) 에만.
- `tools/comment-check.py` 가 괄호가 든 호출 · 화살표 함수도 잡는다 (도움말 티어표 `helpTierHtml` 의 `.forEach` 가 R2.26 부터 주석에 묻혀 비어 있었다).

## 지난 변경 (R2.30 · 신규 지후 11종 · 속성)
- 신규: 스껄 `skul` · 멈춰! `stopj` · 페이즈 `phase` (전설 → 영웅) · 부패 `rot` · 메탈 `metal` · 부루스타 `burner` · 샌즈 `sans` · 스테인리스 `stainless` · 총? `gunq` · 태극 `taegeuk` · 호박 `pumpkin` (도우미 `// ── R2.30 신규 지후 도우미 ──`) · SUMMONS 폭발 스껄 `pkskul` · 병아리 `chick` (닭 지후 부화가 이제 병아리). 초상화 원본 `지후초상화/R2.30/` · **오케스트라 지후는 그림만 받고 능력이 없어서 아직 안 넣었다** (바탕화면 new7).
- **속성** `FIRE_T` (화염 · 태양 · 불사조 · 각성 불사조 · 드래곤 · 태극 · 부루스타): [화상] · [3도 화상] 피해 없음 (`fireImm`) · 대신 공격력 +20% (`burnK`) · `ICE_T` (얼음 · 블리자드): `addStatus` 가 빙결 · 동상을 막는다. 새 불 · 얼음 지후는 여기에.
- 새 상태 `sear` [3도 화상] (아이콘 `icons/fx/sear.png` · 해제되면 보통 화상 `searCleanse`) · `ignite` [점화] (`igniteTick` · 일반 공격 `hitOne` 이 `searOn`) · `rot` (`rotK`) · `corr` · `absorb`. 받는 피해 계산 한 줄 (`dealDamage` 의 rot · sear · 스테인리스) · 메탈은 그 뒤 `d = 2 / 4`.
- 스테인리스 `def.stainless`: 적의 `opts.skill` 피해 · 넉백 (`A.knock`) · 즉사 (`instaKill`) · 절상 · 아공간 무시 · 디버프는 `stRev` (반대로 걸 것만 `ST_REV` · 버프 `rv_…`) · `buffSum` 이 음수 버프를 뒤집는다 (`taken` 제외). 새 디버프를 만들면 `ST_REV` 에 반대 효과를 넣을지 정한다.
- 태극: 배치 기록 `p.tg` ('r' · 'b' · `tgRoll` 친선전은 해시) · `packPlace` 12번째 칸 · 라운드 끝 `tgFlip` · 줄 판정 `tgPowers` (교차 칸은 두 색으로 친다 = [극의 조화] · 조화 폼 = 기본 초상화) · 배치 화면 `renderField` 가 아우라 클래스 `tg-r/b/h` + 줄 번쩍임 `tgFlash` · 캔버스 `CV_RING` · `_cvTgH`.
- build 2: 샌즈 한 번에 공격력 150 → 50% · 총? [탕!!] 즉사 → 공격력 (ATK 99,999) 피해 · 버티면 총알 방향 10칸 넉백 (`gunqFire`) · 인포그래픽 `R2.30-b2` (`R2.30.json` 에서 build 2 칸만 골라 만든다).
- build 3: 서사 120개 · 도감 상세 글 오버홀 (위 규칙) · 전투 HUD — 버튼은 아래 줄 (상대 이름 오른쪽 · 크기 고정 · 예전엔 단계 글자를 덮었다) · **배속 버튼 `#speedSeg` 가 R2.26 부터 안 보였다** (예전 CSS `#speedSeg { display:none }` 이 `.tbar` 밖이면 숨겼다 → `.r1acts #speedSeg` 로 보이게) · 이모티콘 자리는 `emoPlace` 가 덱 줄 (`#flabE` · `#flabA`) 을 재서 겹치지 않게.
- 샌즈 화살표는 캔버스 `CVF.over` 의 `k: 'sans'` (화면 가운데 `W.hw/hh`) · 총? 빛줄기 `FXC.beams`.
- 티어: `TIER_SC` · `infographics/tier-R2.30` 은 R2.30 코드 · 1,600판 · **로컬 윈도우에는 playwright 가 없다 → `tools/tierlist/run-cdp.js` (시스템 크롬 · 일꾼 2개 약 3분)** 뒤 `agg.js` · `apply.py` · make.py · shot.py. 샌즈가 SS 1위 (65.8%) · 메탈 · 태극 D.
- dev 전용 `window.__rejhbt` 에 `effAtk` · `rotK` · `tgPowers` · `instaKill` · `renderField` · `charDetail` 를 더했다 (헤드리스 확인용).

## 지난 변경 (R2.29 · 전장 캔버스 · 버그 수정)
- **전장 캔버스** (`// ═════════ R2.29 전장 캔버스` · `CV` · `cvDraw`): 전투 중 유닛은 `#field` 안 캔버스 `.fx-ucv` 하나에 그린다 (z-index 5 · 카메라의 반대 변환 `cvPlace` 로 화면 크기 그대로). 유닛 DOM `u.el` 은 상태 모델로 남겨 `display:none` (스킬 코드가 classList · 자식을 그대로 쓴다). 몸통 · 체력바 · 레벨 · 효과 아이콘 줄은 미리 그린 그림 `cvSprite` (배율 `cvQ` √2 단계) · 클래스 · 자식은 MutationObserver (`cvWatch`) 가 바뀔 때만 `cvPlain` 으로 다시 본다.
  - **새 유닛 클래스 · 머리 위 요소를 만들면**: 캔버스가 모르는 클래스 · 자식이 붙은 동안 그 지후는 DOM 으로 보인다 (자동 · 안전). 자주 쓰는 상태면 `CV_CLS` (빛나는 둘레는 `CV_RING`) 에 넣고 `cvDraw` 에 그리기를 더한다. 머리 위 글씨는 `span.xlv` 면 캔버스가 읽는다 (`XLV_C` 색).
  - 이펙트: 피해 숫자 `cvNum` · 불꽃 · 총구 · 베기 · 고리 (`A.ring`) · 먼지 · 공격 예고 (`u.tgc` · `cvFan`) · 투사체 (`CV_SHOT` 종류는 `el = CV_STUB` · `cvShot`) 는 `CV.on` 이면 `CVF.under / over` 에. 새 이펙트도 `CV.on` 일 때 캔버스로 (드문 것은 DOM 그대로 돼도 된다). 사망 이펙트는 결정적 순간 슬로 모션 때문에 DOM.
  - 결정적 순간 (`beginFinalMoment`) · 라운드 끝 · 화면 이동 → `cvEnd` 가 유닛을 DOM 으로 되돌리고 떠 있던 피해 숫자는 DOM 으로 다시 띄운다. 비교용 `?dom=1` (예전 DOM 렌더링). 누르기는 `cvPick`.
  - 측정 (CPU ×4 · 50기 · 사용자 PC 가 다른 게임으로 바빠 절대값은 흔들림): FPS 11~14 → 15 · 스타일 + 레이아웃 260 → 85ms/초. 남은 병목은 **전투 계산** (×4 에서 스텝당 약 8ms · 따라잡기 4스텝).
- `loop`: 다음 프레임을 맨 앞에서 걸고 몸통 `loopBody` 는 try · 유닛 스텝 · `A.later` · 투사체 맞음은 `stepErr` (같은 오류는 한 번만) — 한 지후의 오류로 전투가 멈추지 않는다. 프레임 제한은 예정 시각 `frameDue` (90 · 144Hz 도 60번).
- 도둑 [아공간] 절도: `dimReady` (차원 · 훔친 도둑 공용 · 스킬 없으면 2연발만) · 도둑 `tick` / `onDeath` 가 `dimTick` / `dimClose` · 도둑 패시브 `noSpGive` (공격으로만 SP · `spGive` · 충전 `chExcl`) · `spGive` 재귀 막기 `a.spIn` · `skNeed` 는 스킬이 없으면 Infinity.
- 친선전 `packPlace` 10번째 칸 = 늑대 `wf` · 봇전 `S.coinSlot` 도 경기 시작 시세 (`matchBase`).
- 기록 보호: `xkStash` (normProfile 맨 앞) — 이 버전이 모르는 지후 (owned · shards · enh) · 아이템 · 테두리는 `p.xk` 에 맡겨 두고 아는 버전이 되돌린다 · 백업 기록에 `profile.gv` (게임 버전) · 서버 기록이 더 새 버전이면 `backupNow` 가 쓰지 않고 업데이트 창.
- 햄버거 점 `menuDot` = 메뉴 항목 점 (`MENU.some`) · 아케이드 상점은 시트 `hasArcShop` (`UI2.st.arcShop`) · 우편 받기 → `mailSummary` 정리 창 (새 지후만 뽑기 연출) · 로비 1초 타이머 `u2Render(true)` 는 HTML 이 같으면 건너뛴다.
- 주석 검사 `tools/comment-check.py` 가 「주석 뒤에 묻힌 호출 · 선언 · if」 도 잡는다 (R2.25.4 부터 차원 지후 아공간 초상화가 묻혀 있었다). 티어 하네스는 판 사이에 `#field` 를 비운다.

## 지난 변경 (R2.28 · 리더보드 · 시그니처 색)
- **시그니처 색** `SIG_C` (PORTRAITS 바로 뒤 한 줄 · `tools/sig-color.py` 가 쓴다 · 손으로 고치지 말고 `SIG_FIX`) · 값은 `'#hex'` 또는 두 색 `'#a,#b'` · `sigC(id)` 한 색 · `sigBg(id)` 늘 `linear-gradient(...)` (두 색이면 135° 그라데이션) · 숨은 지후는 `rankOf` → `CHARS.color`.
- **덱 설정 화면 (지후 탭 덱 슬롯 · 카드) 은 등급색 그대로**, 그 밖의 덱 표시 (로비 부채꼴 · 프로필 대표 덱 `pfDeck` · 리더보드 · 전장 덱 `.fdeck span.sg` · 전투기록 · 유저 정보 · 탑 덱 `.pic.sg`) 는 시그니처 색. 그라데이션 테두리는 `border: transparent` + `background: linear-gradient(#fff,#fff) padding-box, <sigBg> border-box` (둥근 모서리 그대로).
- 리더보드 기본 탭 `lbTab = 'cp'` (레벨은 두 번째) · 줄을 높게 (`k-lbfav` · `k-lbpic` · 랭크 `k-lbrk`) · `lbPush` 가 덱 랭크 `rk` (1~6 배열) 를 올린다 → **firestore.rules `rkOk` 게시 필요** (예전 규칙이면 `FB.noRk` 로 빼고 다시).

## 지난 변경 (R2.27 · 로비 UI 리뉴얼 · 애니메이션)
- 시안 「네이비 리파인 v2」 (사용자 바탕화면 zip · 캐주얼 모바일 문법): `ui2Tpl` 마크업 + CSS 블록 `/* R2.27 로비 UI 리뉴얼 */` · `/* R2.27 모드 화면 */` · `/* R2.27 화려한 애니메이션 */` (`#ui2` 안 `k-` 접두사 · **버튼 클래스는 `kb`** — `k-btn` 은 예전 게임 클래스라 겹친다). 잉크 `#0e1226` · `.k-ol` 글자 외곽선 · `.k-pnl` 패널 · `.kb.k-gold/k-mint/k-navy/k-dia/k-off` · `.k-seg > .on` · `.k-pc` 초상화 카드.
- 값은 `u2Vals()` = `u2ValsBase()` (예전 그대로) + **`u2Extra(v)`** (새 마크업 값 · 덮어쓰기) · 프로필은 `u2PfExtra` (정보 · 전적 · 아바타(`fav`) · 테두리). 로비 덱 부채꼴 `K_FAN` · 높이 맞춤 `u2FanFit` (예전 `u2ArenaFit` 이 부른다).
- 온라인 탭 = 랭킹 (`u2Go('rank')`) · 위 스위치 `onSw` 로 친구 · 친선전 (`openSocial` · `UI2.st.onSub` 기억). 탑 · 경쟁전 · 샌드박스는 전체 화면 페이지 (`K_PAGE` 색 · `.k-hostfull` 안 기존 화면 · 안쪽 `.ph` 숨김). 이벤트 · 랜덤전 · 미러전은 모드 로비 `UI2.st.mode` (`K_MODE`) → 시작 버튼 `modeGo` 는 `ARC_SURE` 로 티켓 확인 창 없이.
- 경쟁전 로비 `renderComp` hero 를 시안대로 (`kc-*` · R1 검은 화면 `r1c` 은 지운다) · 탑 진행 `kt-hero` (현재 층 · 하트).
- 애니메이션은 **transform · opacity 만** (로비 전용 · 전투 중엔 `#ui2` 가 숨어 멈춘다 · 50기 벤치 변화 없음) · 탭 효과 `K_TAP` → `.k-tapfx` (링 + 별 · 0.52초) · `prefers-reduced-motion` 이면 끔 · `:has()` 는 쓰지 않는다.
- 보조 문구는 시안대로 Pretendard (`.k-sub`) · 제목 · 버튼은 Black Han Sans 그대로.

## 지난 변경 (R2.26 · 화면 개편 · 밸런스 35종)
- **로비** (`ui2Tpl` 전투 탭): 스크롤 없이 한 화면 · 친선전 버튼 · 모드 토글 · 부스트 줄 삭제 · 부스트 배지는 `.u2-cta` 밖 (overflow:hidden 에 잘렸다) · 아레나는 `u2ArenaFit` 이 남는 높이만큼 scale.
- **일반전은 늘 클래식** (`profile.mode` 안 씀) · 이벤트 모드는 아케이드 `ARC_MODES.event` → `EV_NEXT = true` 뒤 일반전 한 판 (보상 그대로 · 무료) · **랜덤전** `random` (미러전과 같은 요금 · 서로 다른 무작위 덱).
- **햄버거 `MENU`**: 퀘스트 · 업적 삭제 · 랭킹 / 전투기록 / 가방 / 패치노트 / 도움말 / 크레딧 따로 · 코드 입력은 환경설정 `#setCode` · 튜토리얼 · 인트로 만화 · 티어리스트 (`helpTierHtml` · TIER_SC) 는 도움말 안.
- **전투 화면 R1 처럼**: `.hud.r1hud` (라운드 배지 · 단계 · `.r1acts` 에 EMOTE `#btnEmo` · 배속 `#speedSeg` · 스탯 `#btnStatsHud` · 설정 · 항복 `#btnQuit` · 타이머) · 아래 줄 상대 · 트레이는 흰색 · 자동 배치 버튼 「배치」 · 덮어쓰는 CSS 는 `/* ═══ R2.26 전투 화면 */` 블록 (!important · 예전 u2 남색 규칙을 덮는다) · 전장 덱 `.fdeck` 네모 40px.
- **경쟁전 로비 R1 처럼**: `#screen-comp.r1c` · `renderComp` 의 `hero` (육각 `.hex` · TP 링 · 사다리 · `#cpStart` 금색) · 아래 규칙 · 보상 카드는 그대로.
- 도감 능력치 줄을 누르면 1랭크 기준 (`s.statR1`) · 덱 추천: Lv.10 까지 추천 · 그 뒤 랜덤 덱 · 둘 다 `recRoll` 2초 연출.
- 배치 카드: 바로 앞 배치 기회에 놓은 지후 (`S.lastPut[진영]`, `applyAct`) 는 `rollPool` 에서 뺀다 (덱에 그것뿐이면 그대로).
- 뽑기 `CFG.GACHA` 전설 2.7 · 영웅 7 · 희귀 27.8 · 일반 62.5 · 일반 · 희귀 `ENH_SHARD` 2배 (초기화권 환급도 새 값 기준이라 예전에 싸게 올린 랭크를 초기화하면 더 돌려받는다 — 알고 둠).
- 지후의 탑: `TOWER_LIVES` 2 · `towerPersona` 1층만 초보 · 5층부터 초고수 반반 · 10층부터 초고수 · 봇 덱은 같은 등급이면 TIER_SC 높은 지후 · 15층부터 `makeUnit` 이 봇 체력 · 공격력 ×(1 + 0.1 × (층 − 14)).
- 개구리: 25% (랭크 6 27.5%) · 결과는 `S.fx` 의 `txt` → `renderField` 가 그 칸 위 `.fx-tiletxt` (배너 아님) · `frogSweep` 은 빈 함수 (이벤트 · 괴도로 오른 레벨은 그냥 레벨).
- 엔지니어 포탑 `c.tdecay` (20초 수명 · `stepUnit`) · EMP 패시브 `empDrain` · 수은 보호막 막대는 체력바 밖 (`.unit-hpbar-wrap` 에 붙여 `left = 체력 비율`) · 성검 현재 체력 5% + 레벨마다 1% · 괴도 `onStart` 예고장 · 랜턴 흡혈 대신 빔이 맞을 때 5 × 레벨.
- **업데이트 알림 (웹 푸시)**: `pushAsk` (튜토리얼 끝 · 기존 유저 로비 한 번 `profile.pushAsk` · 환경설정 `#setPush`) → 허용하면 ◆`CFG.PUSH_DIA` (`profile.pushRw`) → `pushRegister` 가 firebase-messaging 토큰을 `push_tokens/<uid>` 에 (`CFG.PUSH_VAPID` 가 비어 있으면 저장 안 함) · `sw.js` push / notificationclick · **보내기**: 버전을 올린 업데이트 (잠수함 패치 제외) 를 배포한 뒤 사용자 PC 에서 `node tools/push-send.js --key <서비스 계정 JSON>` (제목 · 내용은 버전 · 패치노트에서 · `--dry` 로 기기 수만).
- 글꼴은 Black Han Sans 그대로 (R2.26 에 리틱체 · 송명체를 시험했다가 사용자 요청으로 되돌림 — 다시 바꾸지 않는다).

## 최근 변경 (R2.25 · 신규 지후 5종)
- **케이크** `cake` (영웅 · 커뮤니티 Kaden · 사용자가 준 두 능력치 중 첫 줄 HP 2250 · ATK 120 · 3초 + 이동 1.8): `onHit` → [중독됨] `addict` (300초 · `addictX.by` · `dealDamage` 에서 그 케이크가 아닌 대상에게 −15%) · 체력 25% `cakeCall` → 맨 뒤 줄 조각 케이크 8기 (SUMMONS `cakeslice` · `sliceSteer` 다친 가장 가까운 아군에게 → 자기 현재 체력만큼 회복 → 사라짐).
- **흡혈** `vampire` (영웅 · 사거리 5.7): [흡혈] 리워크 — 대상이 쓰러질 때까지 `vampTick` 0.2초마다 대상 최대 체력 2.2% · 대상 SP −2.2% · 자신 최대 체력 2.2% 회복 · 자신 최대 SP 2.2% 흡수 (build 3 · 직접 `u.sk` 에 채움) · 멈추고 공격 안 함 · 빔은 `FXC.beams`. (스킬 훅 `skill.hold(u)` 는 `afterHit` · `spGive` 에 남아 있지만 지금 쓰는 지후 없음)
- **파멸** `ruin` (전설 · id 는 STATUS `doom` 천살성과 겹치지 않게): 11초 `ruinGo` → 레벨 −1 · `S.deck` 무작위 지후로 `A.transform(…, true)` (이번 라운드만) · 변이할 때 반경 10칸 공격력 4444% (`ruinBoom`) · Lv1 이면 대신 반경 10칸 **적 최대 체력 25%** + 소멸.
- **탄핵** `impeach` (전설 · 공격 간격 1.5초는 내가 정함): `onDamaged` 적에게 맞은 횟수 18 → `impeachGo` 쉴드 1500 × 레벨 · 공격력 · 사거리 2배 · 모든 적 [도발] `taunt` 7초 (`aiSteerAndAttack` 이 `tauntX.by` 를 먼저 노린다).
- **차원** `dimension` (전설 · R1 로직): 2연발 · 3번 뒤 [아공간] 3초 — **`u.realm` 층 번호**: `foes` · `friends` · `canTarget` · `dealDamage` · `physSolvePair` 가 같은 층만 본다 · [공포] `fear` 0.7초 (`aiSteerAndAttack` 맨 앞 · 공격 안 하고 도망). R1 아공간 초상화 `dimension_realm` 은 archive/v8.1 에서.
- 새 상태 `addict` · `taunt` · `fear` · `realm` (`STATUS` · `FX_OF` · 도움말). 인포그래픽 extract.js 도 `--mute-audio`.
- build 2: 덱 설정 정렬 `u2Sorted` — 칸 (등급 · 역할군) 안은 늘 출시 순 (`Object.keys(CHARS)` 순서 · 방향 `sortDir` 은 칸 순서만 · 이름순은 가나다).

## 지난 변경 (R2.24 · 신규 지후 4종)
- **불사조** `phoenix` (전설): `onLethal` → `phxLethal` 체력 1 + [불사조 쉴드] `u.phx` (350 × 레벨 · `dealDamage` 에서 수은 다음 · 일반 쉴드보다 먼저 · 깨지면 `phxBreak` 뒤 쓰러짐) → 3초 뒤 `phxRise` = `A.transform(u, 'phoenix2', lv, keepSlot)` (**배치 기록은 그대로** · 이번 라운드만) · 반경 4칸 넉백. **각성 불사조** `phoenix2` 는 숨은 항목 (`rankOf: 'phoenix'` → `makeUnit` 이 불사조 랭크로) · `phx2Attack` 6% [비행] `phxFly` (ghost · 적진 끝 → 우리 진영 맨 뒤 → 제자리) · 4% [업화] `phxBlaze` (12.6칸 · 화상).
- **버섯** `mushroom` (영웅): `mushEat` · 최대 체력 +35% · 공격력 +12.5% 모두 **처음 최대 체력 · 공격력 기준 선형** (`u.msN`) · 독버섯은 1초마다 최대 체력 15% × 4 (합 60% · 사용자 문구 「15% 를 4번」으로 읽음).
- **늑대** `wolf` (전설): `wolfTick` · 대상 없음 0.5초 → 무작위 적 등 뒤로 · `u.critP` (치명타 확률 · 부상보다 우선) · `u.critD` (치명타 피해 +) 는 `dealDamage` 범용 필드 · 순간이동 수는 배치 칸 `p.wf` (경기 내내 · 합체는 큰 쪽).
- **기상캐스터** `weather` (전설 · 커뮤니티 Kaden · 출격제한 1): `wxSet` / `wxTick` · `WX` 폭염 (3초마다 모든 적 200% · 공격력 증가 없음 · 버프 `heat` 둔화 · `performAttack` 맨 앞에서 25% 로 `heatAlly` 사거리 안 자기 아군) · 태풍 (`A.line` 이 이제 관통탄 객체를 돌려준다 · `.fx-wx-obj` · 처음 맞은 적에서 사라진다 `ln.done`) · 낙뢰 (`fx-bolt`). 늑대 ATK 100 (출시 전 40 → 100).
- 탄환 [최후의 탄환] 체력 손실 16 → 10% · 간격 0.6 → 0.25초.
- build 4 **오프라인 모드**: `sw.js` 가 설치할 때 CORE (아이콘 · 효과 아이콘 · 효과음 · 만화 · 이모티콘 썸네일 · 약 2.2MB) 를 받고, 배경음악 (범위 요청 → 처음 한 번 통째로) · 큰 이모티콘 · 글꼴은 쓸 때 `rejhbt-r2-rt` 에 · **로컬 파일을 더하면 `python tools/sw_assets.py` 로 CORE 를 다시 만들고 `CACHE` 끝 숫자를 올린다**. 켤 때 서버에 못 붙으면 게스트는 바로 `offMode()` · 계정 기록이 있으면 `renderGate('offline')` 의 「오프라인으로 플레이」 → `OFF.on` · `body.off-mode` · 로비 `#offPill` · `online` 이벤트에 새로고침 안내 (서버와 맞추기는 기존 `bkWid` · `serverNewer`). 확인: `node tools/offline-test.js` (임시 서버 8781 → 끄고 새로고침 · 바깥 주소 모두 막음 · 소리 끔).
- build 7: 부스트 하루 3번 · 30분 (`CFG.BOOST_*`) · 일반전 버튼 오른쪽 위 빨간 배지 (u2 `boostBadge` · `.u2-bb` 는 1초 타이머가 글자만) · 상점 빛나는 조각 가중치 절반 (`SHOP_ITEMS.glow*.w`) · 이벤트 등급 `EV_GRADE` [45, 35, 20] · 관통탄 `stepLines` 는 이제 `translate` 로 옮긴다 (처음 자리만 left/top). 렉 확인 `node tools/perf-typhoon.js` (헤드리스라 폰 GPU 렉은 안 보인다 · 상대 비교만).
- build 5 **앱 다운로드**: 햄버거 `MENU` 「앱 다운로드」 → `appInstall()` (`beforeinstallprompt` 를 `APP.evt` 에 받아 두었으면 `prompt()` · 아니면 기기별 안내 dlg · 앱으로 실행 중이면 `appStandalone()` 「설치됨」). 예전 주소 `wwwsebon-cloud.github.io/JHBT` 에 설치된 앱은 오프라인이면 그 주소의 옛 사본 (5.7.6 무렵 · 10/2 도메인 이전 전) 이 뜬다 — 서버에서는 못 고친다 (지우고 jihoobattle.kr 에서 다시 설치).
- build 2: 덱 설정 5열 (`gridTpl` · 긴 이름 `nmFs`) · 서버로 보내는 지후 id 는 `CID_RE` `^[a-z][a-z0-9_]{0,23}$` (예전 `^[a-z_]` 가 c4 를 뺐다 · `firestore.rules` 도 · 예전 규칙이면 `FB.oldIds` 로 다시). build 3: 태풍 0.6초 · 무작위 방향 · `A.line` 의 `home` · `turn` 살짝 유도 (`lineHome`) · 관통 · 낙뢰 2초 600% (build 6: 태풍 200% · 낙뢰 300% · 폭염 짜증 10% · **build 7 최종안**: 폭염 300% · 짜증 20% · 공격속도 −10% · 이동 −25% · 낙뢰 400% · 태풍 0.9초 · 맵 둘레 무작위 자리 → 맵 안 무작위 자리 · `turn` 0.2 · 0.6칸 · 맞을 때 `hitFx(…, false)` (예전 big = 큰 불꽃 + 화면 흔들림이 관통마다 겹쳐 렉)) · 늑대 HP 1450 · 1.25초 · `lifesteal` 0.2 · `gauge` · `wolfBlinkFx` (캔버스 줄기 `FXC.beams` 의 `c1 · w1 · c2 · w2`) · 불사조 ATK 110 · 각성 140.
- 패치 스크립트로 `index.html` 을 고칠 때 **줄바꿈이 섞여 있다** (i/mixed) — 파이썬으로 통째로 읽고 쓰면 CRLF 가 LF 로 바뀌어 diff 가 2만 줄이 된다 (원래 줄바꿈을 지킬 것: `open(..., newline='')` 로 읽고 쓰기). **Edit 도구도 index.html 의 섞인 줄바꿈을 한쪽으로 바꿔 버린다** (R2.29) — index.html 은 `newline=''` 파이썬 치환으로 고친다.

## 그 전 변경 (R2.23.1 · 밸런스)
- EMP 파동 `empWave` 50 → 35% · 엑시노스 `gpuTick` 오르는 양 2배 (최대 50% 그대로) · 화염 공격력 140 → 120.
- 탄환 공격력 135 → 100 · 사거리 6.2 → 6.4 · [최후의 탄환] `bulletLast` 간격 0.45 → 0.6초 · `bulletCost` 24 → 16% · 처치 회복 50 → 65%.

## 그 전 변경 (R2.23)
- **이벤트 모드** (예전 랜덤 이벤트를 갈아엎음 · 옛 목록은 `EV_OLD` 로 R2.6.1 패치노트에만): 일반전 로비 토글 (🎴 이벤트 모드 / 클래식) · 하트 `CFG.EV_LIVES` 4 · 보상 (승리 XP · 골드 · 부스트 ◆) ×`EV_REWARD` 1.3 · 친선전 · 아케이드 · 튜토리얼 · 벤치는 `evOn: false` (matchBase 기본도 false).
- 짝수 라운드 `evRoll`: 등급 `EV_GRADE` [50, 35, 15] (양쪽 같다) → `evDeal` 카드 3장씩 (따로) → 봇은 `evBotPick` 바로 · 나는 `evShow` (#evPop · 15초 `EV_PICK_SEC` · 시간 초과 무작위 · S.fast / 리플레이는 바로 무작위).
- 고른 이벤트 `S.ev[진영] = [{ id, g, c }]` → `evRecount` → `evN(진영, id)` = 수치 합 (%) · 덱 강화는 `'deckA:<id>'` · `'deckS:<id>'`. 이벤트 데이터 `EVENTS[id].v` = [브론즈, 실버, 골드] (0 = 그 등급엔 없음).
- 적용: 체력 · 공격력 `evUnit` (전투 시작 · 하드코어는 `S.lives` 가 `S.maxLives` 일 때 · 소수정예는 배치 4기 이하) · 공격속도 `u.evAspd` → `evCombat` 버프 'ev' · 피의 갈증 `dealDamage` · 마력의 힘 `evSp(u)` (SP 를 채우는 곳마다 곱한다 · hit SP 가 소수가 될 수 있다) · 합체 / 합성마스터 `evMerge` (`levelUp` · 합체 뒤 · 소환은 `f: 'b'`).
- build 2: 카드 화면 = 슬롯머신 (`evShow` · `.evx` · 등급 릴 → 카드 릴 3개를 WAAPI `strip.animate` 로 위에서 아래로 · 차례로 멈춤 · 효과음 `ev_tick` · `ev_land` · 도는 중 누르면 `a.finish()` · 카드 앞면 `evFaceHtml` · 상대 선택 `evMiniHtml`) · 설명 줄은 사용자 요청으로 없음.
- build 2 이벤트 13종 추가 (fast as f boi · 속전속결 · 레벨업 · 스피드 콤보 · 중앙 Good · 선봉대 · 천살성 · 단체 레벨업 · 모 아니면 도 · 지원요청 · 베테랑 · 평준화 · 자힐 · 약점공략) · 마력의 힘 실버 12 · 골드 25%. 고르는 순간 효과 (`ins`) 는 `evInstant` → `evSnap` (S.roundStart 다시) · 레벨업 `evRoundWin` (roundResult) · 자힐 `evTick` · 받는 피해 `evTaken` (약점공략 · 천살성) · 스피드 콤보 스택 `S.evf[진영].combo` (`evMerge`) · 베테랑 칸 `S.evf[진영].vet` (renderField `.tile.ev-vet`).
- **배치 기회 (모든 게임 · build 2)**: 라운드마다 `CFG.DEPLOYS` 3 · 데스매치 `CFG.DM_DEPLOYS` 4.
- 새 이벤트를 만들면 `EVENTS` · `evUnit` / `evCombat` / `evInstant` 등 적용 · `evBotPick` 의 W · 패치노트.

## 그 전 변경 (R2.22.3)
- 밸런스 8종: 모노리스 아군 충전 1.5% (`monoTick` 아군마다 초당 6) · DJ HP 1600 · EMP ATK 75 · 파동 50% · 달 2.2초 · 순풍 ATK 15 · 카우보이 골드 8% · 40~199 · 마피아 4.1초 · 랜턴 회복 빔 60% + `lifesteal: 0.3` (아케인과 같은 흡혈).

## 그 전 변경 (R2.22.2)
- 도둑 지후 리워크: HP 1200 · ATK 100 · 0.75초 · 이동 3 · 첫 공격만 [절도] (`customAttack` 은 `u.bg.done` 이면 false → 일반 공격) · 훔친 뒤 제자리 고정 (`steer`) 과 시간 SP (`burglarTick`) 삭제 · 훔친 스킬은 `type: 'hit'` 사본 (`need` = 주인 `t.need || sk.need` · 쿨타임 스킬은 `cd` 초 · SP 없는 핵미사일은 그대로) → `afterHit` 이 공격마다 SP +1.
- build 2: 도둑 이동 3.3 · 스파이 변장한 뒤에도 치명타마다 또 변장 (`spyCrit` 이 스킬이 spy 가 아니면 `spyMorph` 를 바로 · 변장한 지후의 스킬도 그대로 = 이중 스킬) · C4 폭발 35% · 수은 1.5초 · 부하 지후 `goon` 1.25초.
- build 3: 마피아 역할군 딜러 → 소환형 (배치 줄 `roleRow` · 봇 칸 고르기도 역할군을 본다).
- build 4: 도둑 ATK 50 · 이동 2.8.
- build 6 (잠수함 · 시뮬 · 인포그래픽 없이): 돌격 ATK 205 · 1.65초 · 돌진 기절 2초 기본 (랭크 6 +1초) · 포탑 ATK 40 · C4 사거리 7 · 일반 공격 탄 `fx-projectile.c4` + `shotSpeed` 10 · 아케인 HP 1050 · 물 2초 · [해일] 30% + 잃은 체력 20% · **도감 능력 설명 오버홀 54종** (핵심만 한두 문장 · 자세한 수치는 `CHAR_INFO` — 새 지후 설명도 이 기준으로: 황사 · 슬라임처럼).

## 그 전 변경 (R2.22.1)
- 코인 지후 시세 리워크 (`coinState` · `coinStep` · `COIN_RG` · `COIN`): 10분 칸 · 배율 **0.3 ~ 4배** · 장세 4개 (상승 · 하락 · 횡보 · 광기 · 몇 시간씩 · 바뀔 확률 `stay`) · 비율로 오르내림 (복리) · 칸마다 1% 펌핑 +30~80% / 떡락 −30~60% · 기준 0.85 쪽으로 약하게 끌림 (5년 시뮬 평균 1.00배) · 친선전 두 화면이 같아야 해서 **덧셈 · 곱셈 · 나눗셈만** (Math.log · exp 금지) · 마지막 칸 상태 `coinSt` 에서 이어서 계산 · 배너는 없음 (사용자 요청 · 수치만).
- 도감 · 덱 공격력 칸 = 지금 시세 (`dexAtk(c)` · `enhStat` 이 코인이면 `coinMult()` 를 곱한다) · 랭크 6 [존버 정신] 피해 감소 최대 50%.
- build 2 밸런스: 화염 HP 1440 · ATK 140 · 검 HP 1530 · 암살 HP 580 · ATK 156 (튜토리얼은 `TUT_STATS` 라 그대로).

## 그 전 변경 (R2.22)
- 밸런스: 비 ATK 35 → 25 · 콤보 공격마다 10 → 7% · 저격 ATK 1000 → 800 · 거리 감소를 **반대로** (`sniperCut` = 가까울수록 · 바로 앞 50% · 사거리 끝 0% · 서사: 근시 → 원시).
- 랭크 6 고유능력 32종 추가 (`ENH_SKILL` · 도우미는 `reapFx` 앞 `// ── R2.22 랭크 6 고유능력 도우미 ──`): 비 SP 7 (유닛별 SP `u.need` → **`skNeed(u)`** · SP 를 읽는 곳은 `sk.need` 대신 이것) · 주사 새 상태 **`noheal` [회복 불가]** (`heal` · 유물 회복이 막는다 · 아이콘은 healDown) · 독 [신경독] `u.vAtk` (venom 중독 X 의 `v6` · 틱마다 +1 · 공격력 −0.5% · 중독이 끝나면 0) · 소믈리에 와인 랭크 6 분은 `wn6` (배치 기록 · 합체 · 반중력 분열에도) · 고고학자 `S.arch6[진영]` (낡은 → 다음 전설 · 클로버보다 먼저) · 홍명보 `t.ballBy` + `hongHold` · 랜턴 `lanAura` (buff `lanUp` · `lanDn` 0.5초씩 늘림) · 죠스 `jawsStack` (buff `jaws6`) · 개구리는 배치 단계라 `enhOf(side, 'frog')`.
- build 3 (추가 패치 · 표시만): 도둑 지후 [절도] 뒤 머리 위에 스킬 주인 초상화 — `u.bgOwn = { id, src }` (도둑에게서 훔치면 원래 주인) · `bgPic(u)` 가 효과 아이콘 줄 레이어 `u.ufxEl` 안에 `.bg-pic` (아이콘이 있으면 `.status-icons:not(:empty) + .bg-pic` 로 그 위 · `ufxOf` 가 레이어를 새로 만들 때도) · 스파이 [변장] 뒤 `u.spyDis` → `unitEl` 이 `spy-dis` (보라 테두리 #5b2a6e · 진영은 체력바 색) · C4 공격 간격 6.2 → 4초 (서사: 인사를 「나중에 펑」으로 줄임) · **튜토리얼은 고정 수치 `TUT_STATS`** (화염 · 얼음 · 물 · 쉴드 체력 · 공격력 · 간격 · 사거리 · 이동 · 쉴드 · `makeUnit` 이 튜토리얼 판에서 CHARS 대신) + 봇 배율 `TUT_EBUFF` { 2: 1.35, 3: 1.8 } — 밸런스를 바꿔도 튜토리얼은 안 건드린다 (스킬 · 패시브 동작을 바꿀 때만 1~4라운드 승패를 시뮬로 확인).
- build 4: 코인 도감 상세의 「반전 확률 55%」 줄 삭제 (반전은 R2.17.2 에 이미 삭제 · `coinMult` 는 반반).

## 지난 변경 (R2.21.2)
- 밸런스 11종: 충전 SP 2.5% · 반경 3.6칸 · [급속 충전] SP 13 · 태양 HP 2200 · 모노리스 아군 충전 3배 (`monoTick` 안 6 · 밖 3 %/초) · 사신 · 부활 SP 와 부활 대상에 소환체 · 분열체 포함 (부활은 `revL` 에 `ch` = 쓰러질 때 체력 · 공격력 · 분열 깊이 · 소환자로 되살린다) · 최후의 탄환 쓰러질 때까지 (`bulletLastEnd` 안 부름) · 24% · 고고학자 유물 45 · 30 · 20 · 5 (`RELIC_TIER` · 클로버는 전설 + 개쩌는 합 안에서) · 폭주족 최대 체력 75% · 소믈리에 ATK 115 · 포식 **전설** · ATK 100 · [포식]당 25% · 광폭화 ATK 170 · 3초.

## 그 전 변경 (R2.21.1)
- 밸런스 12종: DJ ATK 25 · 드래곤 ATK 50 · [비행] 5% · 불길 50% · 태양 ATK 20 · 블리자드 [빙결] 2초 · BB탄 ATK 140 · 모노리스 HP 2300 · 레이저 **최대 체력** × 레벨 × 12% (`monoFire`) · 왜곡 50% (`warpOn`) · ATK 50 · 저격 ATK 1000 · 7.5초 · 거리 감소 최대 50% (`sniperCut`) · 마탄 550% · 2.6초 · 탄환 ATK 135 · 슬라임 HP 1200 · 죠스 ATK 200.
- 봇 조커 (모든 페르소나 · 왕초보 포함): `botDeployOne` 맨 앞에서 조커 카드가 나오면 무조건 합친다 · 변신 `botJoker` 는 배치마다 50% → **`beginCombat` 맨 앞에서 무조건** (등급 · 레벨 · TIER_SC 높은 지후로 · 친선전 · 리플레이 · 튜토리얼 · 샌드박스 제외).
- 모바일 스크롤: 새 로비 세로 스크롤 칸 (`flex:1; min-height:0; overflow-y:auto` 인 칸) 에 `.u2-scroll` → 자식 `flex-shrink:0` — overflow:hidden 카드가 flex 안에서 줄어 글이 잘리고 스크롤이 안 됐다 (지후 상세). **새 스크롤 칸을 만들면 `class="u2-scroll"` 을 붙인다.**

## 미뤄 둔 일
- 길드는 사용자 요청으로 아직 만들지 않았다 (만들 때: 생성 ●20,000 · 탈퇴 뒤 24시간 재가입 · 생성 금지 · 최대 5명 · 길드마스터 / 부길드마스터 · 폭파 · 길드 랭킹은 길드원 전투력 합). 전투력 · 리더보드 cp 탭 (R2.21) 자세한 내용은 docs/CLAUDE-history.md 「R2.21」.
