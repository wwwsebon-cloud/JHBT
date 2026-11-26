# RE : 지후배틀 (RE:JHBT) — 작업 규칙

> 이 파일은 매 턴 통째로 읽힌다 → **규칙 · 방법 · 경고만** 둔다. 버전별 연혁 · 함수 이름 · 예전 수치는
> `docs/CLAUDE-history-2.md` (R2.21 ~ R3.5 build 13) · `docs/CLAUDE-history.md` (R2.18 까지) 에서 **필요한 부분만 grep** 해서 본다.
> 정리: 2026-11-25 (예전 148KB → 요약 · 옮긴 원문은 손대지 않았다).

## 꼭 지킬 것
1. **한국어를 쓴다** — 대답 · 코드 주석 · 커밋 메시지 · 패치노트 모두.
2. **작업 전에 이 파일을 읽는다.** 함수 이름 · 예전 수치 · 연혁은 위 두 기록 파일에서 grep.
3. **작업이 끝나면 디스코드 공지용 인포그래픽을 만든다** (아래 「인포그래픽」). 잠수함 패치는 제외.
4. **신규 지후가 나오면 신규 지후 인포그래픽도 · 서사(`story`)가 없으면 서사도** (아래 「신규 지후」).
5. 기본은 **main 에 머지까지** (작업 브랜치 → 커밋 → main 머지). 푸시는 보통 사용자 터미널에서 (사용자가 「푸시해줘」라고 하면 내가 해도 된다). **끝나면 `main` 으로 돌아와 둔다** (작업 브랜치에서 사용자가 `git push` 하면 upstream 없음 오류).
6. 테스트할 때 **실서버 Firebase 에 테스트 계정을 만들거나 로그인하지 않는다.** 실제 계정 데이터를 건드리지 않는다 (`?bench=` · 로컬 프로필 · 헤드리스는 Firebase 주소를 막고).
7. 올리기 전에 **빈 브라우저로 첫 로딩**을 확인한다 (오류 없이 로비까지).
8. **브라우저 테스트는 소리를 끈다** (사용자 요청 · 시끄럽다): `localStorage` 의 `rejhbt-sfx-vol` · `rejhbt-bgm-vol` 을 `'0'` 으로 두고 새로고침 · 헤드리스 크롬은 `--mute-audio`.
9. **⚠️ 주석 사고 주의 (여러 번 남)** — 한 줄에 코드가 길게 이어지는 곳 (`u2Vals` 값 객체 · 한 줄 함수 · 템플릿 문자열) 에 `// 설명` 을 줄 중간에 넣으면 **그 뒤 코드가 통째로 주석이 되어 조용히 사라진다** (오류도 안 난다 · R2.26 초상화 · 이름 실종 · R2.27 `u2FanFit` 의 `if` · R2.31 도움말 티어표).
   - 줄 중간 · 코드 앞에는 **반드시 `/* … */`**. `//` 는 그 줄의 **진짜 맨 끝**에만.
   - 기존 줄 끝 `//` 주석 뒤에 코드를 덧붙이지 않는다 (주석을 `/* */` 로 바꾸거나 줄을 나눈다).
   - 수정 뒤 **`python tools/comment-check.py`** → 「의심 0줄」 확인.
10. **⚠️ 인게임에 쓸데없는 서술을 하지 않는다** (R2.36 사용자 요청): 카드 · 설명 · 배너 · 도감 글에 플레이에 필요 없는 말 (등급 전용 표시 · 부연 설명 · 괄호 속 덧말) 을 붙이지 않는다. 짧게 · 핵심 수치만.
11. **⚠️ 패치노트를 지우지 않는다** (2026-11-17 · 「Add files via upload」 커밋에 R2.10.3 build 2 · R2.11.0 이 조용히 사라졌었다). `comment-check.py` 가 버전마다 항목 수를 `tools/pn-count.json` 에 기록하고 **줄어들면 실패** (일부러 지울 때만 `--pn-ok`).
12. **요청이 모호하면 정해서 하고, 정한 것을 대답에 적는다** (예: 「나머지 전설」 → 일반으로 읽음 · 쿨타임이 다음 라운드로 이어지는지 · 봇이 쓰는지). 되돌리기 어려운 것 (서버 · 계정 데이터 · 공지 올리기) 만 묻는다.

## 이름 · 버전 · 구조
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT** · 지금 **R3.7** (build 1).
- **⚠️ 버전은 하루에 한 번만 올린다** (R2.35 사용자 요청): 그날 첫 업데이트에 둘째 자리 +1 (R3.5 → R3.6) · **「하루」는 달력이 아니라 사용자가 잠들기 전까지** (자정을 넘긴 밤샘은 같은 버전 · 자고 일어난 다음 작업부터 새 버전 · 애매하면 묻는다) · 같은 날 이어지는 패치는 `<meta name="jihoo-build">` +1 (셋째 자리 R3.5.1 은 특별한 경우만). 패치노트는 그날 항목 하나에 `추가 패치 (build N)` 칸을 맨 위에 더하고 title 은 그날 내용을 아우르게 고친다.
- 버전 메타 `<meta name="jihoo-version">` (이름은 R1 과 같아야 한다 · 예전 화면이 새로고침 안내를 띄움).
- **⚠️ 같은 build 번호로 두 번 올리면 열려 있던 앱은 업데이트를 모른다** (버전 · build 비교) → 이미 푸시한 것을 고쳐 다시 올릴 때는 build 를 올린다.
- **잠수함 패치** (사용자가 「잠수함 패치」라고 하면): 패치노트 · 인포그래픽 없이 · build 도 안 올리고 코드만 커밋 · 머지 (커밋 메시지 머리 「잠수함:」).
- `index.html` 하나가 게임 전체 (빌드 없음 · 약 10MB · 초상화 base64 포함). 로컬 테스트: `python -m http.server 8766` → `index.html?bench=` (로그인 없이 · 테스트 함수 `window.__rejhbt` · 개발 주소에서만).
- R1 (v8.1) 코드는 원격 브랜치 `origin/archive/v8.1` (`git show origin/archive/v8.1:index.html` · 로컬 브랜치 없음).
- **사이트 배포 (GitHub Pages · jihoobattle.kr)**: `_config.yml` 의 `exclude` 로 게임에 안 쓰는 폴더 (infographics · tools · docs · app · 지후초상화 …) 를 뺀다 — 배포물이 225MB 가 되자 10분 제한으로 실패했었다 (R2.28 · R2.30). 큰 폴더를 새로 올리면 여기에 더한다. 상태: `https://api.github.com/repos/wwwsebon-cloud/JHBT/actions/runs` · 사이트 버전 `curl jihoobattle.kr` 의 `jihoo-version`.
- **서버 규칙** `firestore.rules` (R2 전체 규칙): 사용자 PC 에서 **`node tools/rules-deploy.js`** (서비스 계정 키 · 경로는 `문서/jhbt-app/rules.json` · `--dry` 로 차이만 · 서버와 같으면 안 함 · 계정에 「Firebase 규칙 관리」 역할) · 콘솔에 파일 전체를 붙여 넣어도 된다. **규칙을 바꾼 작업은 끝날 때 「규칙 게시 필요」를 사용자에게 꼭 말한다** (게시를 잊어 기능이 안 보인 적이 많다 · r2def · bcast · pres …).

## 업데이트 때 할 일
1. `index.html` 수정 — `CHARS` 수치와 함께 `passive` · `skill.desc` · `atkText` · `CHAR_INFO` (도감 상세) · 팁 (`TIPS_MORE` · `BOOT_TIPS`) 에 적힌 숫자도 같이.
2. 버전 / build 메타.
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new · buff · nerf · adjust · rework · fix · system).
4. `python tools/comment-check.py` · 스크립트 문법 (`node --check`) · 헤드리스 전투 · 첫 로딩.
5. 인포그래픽 (아래) → 커밋 · 머지 → 사용자에게 PNG 보내기.
6. 이 파일의 「최근 변경」에 한두 줄 (긴 연혁은 적지 않는다 · 오래된 것은 `docs/CLAUDE-history-2.md` 로 옮긴다).

## 인포그래픽 (저장소 `infographics/`)
- **만드는 순서** (로컬 서버를 켠 뒤): `node infographics/extract.js` → `node infographics/notes2json.js <버전>` → `python infographics/make.py infographics/<버전>.json` → `CHROME=<크롬 경로> python infographics/shot.py "infographics/<버전>*.html"` (크롬 `C:/Program Files/Google/Chrome/Application/chrome.exe`).
- **build 마다**: `<버전>.json` 의 맨 위 칸만 남긴 사본 `<버전>-bN.json` 을 만들어 make · shot (`<버전>-bN.png`).
- **2026-11-24 리디자인 (업데이트 노트 기본 = 덱 레이아웃)**: 흰 바탕 · **1080 × 1350 (4:5) 장 여러 개** (`make.py` `build_deck` · 예전 남색 한 장은 JSON 에 `"layout": "classic"`) · 표지 (버전 크게 · 「오늘 바뀐 것 N가지」 색 띠 · 「그 밖에」 칩 10개까지) → **큰 사건 두 개씩 한 장** (`deck_half` · `"headlines": [{title, icon, color: orange|blue|purple|green|yellow|ink, lead 한 줄, points: [{big, small}] 4개까지, chars}]`) → 밸런스 (빨강 · 노랑 · 초록 타일 · 변경 하나 = 타일 하나 · 3열 × 11줄 · zoom) → 「그 밖에」 (`"more": [{icon, title, line}]` · 칩 10개를 넘을 때만). 「사건 한 장에 하나 · 글은 한 칸에 한 줄 · 숫자는 크게」. **큰 사건은 내가 고른다** (같은 주제의 여러 build 항목을 하나로 묶는다) · `headlines` 가 없으면 표지 한 장 + 7개 넘으면 「그 밖에」. `shot.py` 는 `info-height` 가 있으면 자르지 않는다. 예: `infographics/today-2026-11-24.json` (7장 · 사용자 OK · **인스타그램 캐러셀은 10장까지**).
- **타일 규칙**: 같은 지후라도 패치노트 항목마다 tag 를 따로 (nerf 빨강 · buff 초록 · adjust 는 방향 없는 글 타일만 주황) · 설명에 ` · ` 를 쓰면 타일이 나뉜다 (나뉘면 안 되는 문구는 「와」 · 「(…)」 로) · 타일 글자가 넘치면 패치노트 문구를 짧게 · 글꼴 Lilita One + Do Hyeon (사용자가 고름).
- **하루 총정리** `today-<날짜>.json` (사용자가 오늘은 끝 · 잔다 · 총정리하라고 할 때 · 새 모드는 최종 상태 · 밸런스는 `node infographics/balance-sum.js <처음> <마지막>` 결과에서 고친 타일 · 지저분한 지후는 파일 안 `OVERRIDE`).
- **신규 지후**: `node infographics/notes2json.js <버전> --new` (tag 'new' 지후 · 직접 고르려면 id 를 뒤에) → make · shot. 새 지후는 make.py 의 `NAMES` 와 `infographics/portraits.json` 에도.
- **티어표**: make.py `"type": "tierlist"` · `infographics/tier-<버전>.json` (아래 「시뮬 · 티어」가 만든다).
- **인포그래픽에 게임 스크린샷을 넣지 않는다** (R2.29 · `"shots"` 칸은 안 쓴다 · 눈에 보이는 변화도 글 타일로).
- 리눅스(클라우드)에서는 `CHROME` 에 `--no-sandbox` 래퍼 (extract.js).
- 만든 PNG 는 커밋하고 사용자에게 보낸다 (`SendUserFile`).

## 공지 올리기 (디스코드 · Threads · 인스타그램)
- `node tools/post-patch.js` — 맨 위 패치노트 (그날 마지막 build 칸 · `--all` 은 버전 전체) 글 + 인포그래픽 → **디스코드** (웹후크 · 임베드 갤러리 4장) · **Threads** (공식 API · 500자 → 항목 이름만 · 여러 장이면 캐러셀) · **인스타그램** (`--ig-token` 이 있으면 기본으로 같이 · `--only instagram` · JPEG 4:5 → `tools/ig-slices.py` 가 `infographics/ig/<이름>-ig<N>.jpg` 최대 10장 · 캡션 2,200자 + 해시태그).
- **이미지는 GitHub raw 주소로 받으니 인포그래픽 · ig 조각을 커밋 · 푸시한 뒤에** 올린다 · `--dry` 로 글 · 주소 확인.
- 설정은 저장소 밖 `문서/jhbt-app/post.json` (웹후크 · 토큰 · 올린 기록 `posted`) · `--init` · `--threads-token` (20일마다 알아서 갱신) · `--discord-role <역할 ID>` (핑) · `--no-ping`.
- **매일 마지막 패치만 내가 올린다** (2026-11-12 사용자 허락 · 그 밖엔 사용자가 올리라고 할 때만): build 마다 올리지 않는다 · 하루가 끝날 때 `today-<날짜>` 총정리 → 커밋 · 푸시 → **`node tools/post-patch.js --day`** · 다음 날 첫 작업에서 어제 버전의 `<버전>-day` 가 `post.json` 의 `posted` 에 없으면 먼저 올린다 · 잠수함 패치는 올리지 않는다.
- 웹 푸시 알림 (버전을 올린 업데이트만): 배포 뒤 사용자 PC 에서 `node tools/push-send.js --key <서비스 계정 JSON>` (`--dry` 로 기기 수만).

## 시뮬 · 티어
- **로컬 윈도우 (playwright 없음)**: 서버를 켜고 `node tools/tierlist/run-cdp.js <폴더> <번호> <일꾼 수> <판수>` 를 일꾼 수만큼 (**일꾼 1~2개** · 12개는 PC 가 멈췄다 · 한 일꾼이 시작할 때 페이지가 늦어 죽으면 그 일꾼만 다시 · 이어하기 됨) → `node tools/tierlist/agg.js <폴더> 100` → `python tools/tierlist/apply.py <폴더> <버전> <날짜>` → make · shot.
- **클라우드 (리눅스)**: `tools/tierlist/run.sh <버전> [판수=1600] [병렬=4] [부트스트랩=100]` (4코어 1,600판 약 11분).
- 방식: 무작위 10기 5:5 · Lv1 · 60초 판정 · 남은 체력 차이 점수 · Bradley-Terry · k-평균 · 진영 바꿔 두 번 · 부트스트랩 안정도 · 지난 `TIER_SC` 와 비교 ▲▼ → `apply.py` 가 `TIER_SC` · `infographics/tier-<버전>.json` · `tools/tierlist/history/` 를 쓴다. 자세한 건 `tools/tierlist/README.md`.
- `TIER_SC`: SS 90~100 · S 80~89 · A 65~79 · B 40~64 · C 20~39 · D 0~19 (6티어) · 없으면 50 (B). 표에서만 S 를 S · A+ 로 나누고 · 한 판으로 못 재는 지후는 ? 티어 (`UNKNOWN`: 포식 · 소믈리에 · 예언 · 핵미사일 · 괴도 · 슬롯머신) · 2티어 이상 변동 ▲▲ · ▼▼ · 토큰 5 이상은 금색 딱지.
- 같은 버전을 이어서 돌리면 agg 전에 `TIER_SC` 를 지난 티어표 값으로 되돌려야 ▲▼ 가 맞다. **메커니즘을 바꾸는 중에 돌린 시뮬은 무효** — 마지막 코드로 다시.
- 지금 `TIER_SC` · `tier-R3.5` = R3.5 build 13 코드 · 1,600판 (1위 더블딜러 66.6% · 꼴찌 조커).
- 고정 시드 전투 120판 비교 (`tools/tierlist/run.js`) 는 「동작을 안 바꾸는 정리」 확인용 (아래 리팩터링).

## 신규 지후 체크리스트
- 초상화: **흰 배경 256×256 PNG** (투명 금지) → `PORTRAITS` (base64) · 원본은 `지후초상화/` 또는 사용자가 준 폴더.
- **시그니처 색**: 초상화를 넣은 뒤 `python tools/sig-color.py --sheet <확인표.png>` → `SIG_C` 갱신 · **확인표를 눈으로 보고** 다르면 파일 안 `SIG_FIX` 에 `'id': '#색'` (두 색 `'#a,#b'`) 후 다시.
- **토큰 `tok`**: 사용자는 3~4 지후만 정해 준다 · 나머지는 내가 정해 `CHARS[id].tok` (없으면 `TOK_COST` → 2) · 1 = Lv1 물량이 많아도 판도를 안 흔드는 지후 · 2 = 대부분 · 3 = 살짝 비싼 · 4 = 하나로 판을 바꾸는. 정한 값은 알린다.
- `CHARS` 끝에 추가 (도우미 함수는 `reapFx` 바로 앞 `// ── R3.x 신규 지후 도우미 ──`). 안 준 역할군 · 사거리 등은 정하고 알린다.
- `passive` · `skill.desc` 는 **쉽게 · ~니다 · 한두 문장** (중요한 숫자만 · 예: 황사 · 슬라임) · 자세한 숫자는 `CHAR_INFO[id]`.
- **서사 `story`**: ~입니다 · ~해요 체 · 5~7문장 · **개그 · 병맛 톤** (말도 안 되는 사건 · 반전 · 마지막 한 줄 펀치라인 · 외양 묘사는 줄인다) · 지후왕국 세계관과 다른 지후를 엮는다 (아래 「세계관」). **AI 티 금지**: 인용문 (「…」 · "…") 금지 · 능력과 관련된 숫자 금지 (세계관 숫자 1호 · 314호 · 3년은 괜찮다) · 능력 서술은 최소 · 밸런스 핑계는 숫자 없이.
- **도감 `CHAR_INFO`**: 버전명 · 「예전엔」 쓰지 않는다 (지금 규칙만) · 부정 설명은 꼭 필요할 때만.
- 뽑기 · 덱 · 도감에 안 나오는 변신 지후 (`prince` 등) 는 `Object.defineProperty(CHARS, id, { enumerable: false })`.
- 새 상태 · 버프는 `STATUS` · `FX_OF` / `fxList` · `BUFF_SRC` · 지후 매거진 `MZ_STC` · `MZ_STD` · 스테인리스 반전 `ST_REV` 를 정할지.
- 배치 기록 (`S.place[side][t]`) 에 새 필드를 넣으면 친선전 `packPlace` / `unpackPlace` 와 합체 (`moveTile` 의 `canFuse` 줄) 에도.
- 불 · 얼음 지후는 `FIRE_T` · `ICE_T` · 새 컬렉션은 `COLS` · 인접 버프 지후는 `ADJ_BUFF`.
- 헤드리스 전투 테스트 (오류 · 이펙트 잔상 · 스크린샷) · **50기 이상에서도 프레임 드랍이 없게** (아래 「성능 규칙」 · 벤치).

## 성능 규칙 (새 지후 · 새 이펙트)
- 이펙트는 **`transform` · `opacity` 애니메이션만** (`box-shadow` · `filter` · `border-color` · `background` · `width` 를 애니메이션하지 않는다 · 큰 반투명 그라데이션 원을 매번 새로 만들지 않는다).
- CSS 에 **`[style*=…]` 같은 style 속성 선택자 금지** (인라인 style 이 바뀔 때마다 자식 전체 재계산).
- DOM 위치 · 크기는 프레임마다 한 번 이하 (`tick` 은 한 프레임에 여러 번 · 바뀐 값만 · `translate`).
- 매 스텝 `A.status` · `A.buff` 를 다시 걸지 않는다 (이미 걸려 있으면 남은 시간만 늘린다).
- 자주 생기는 이펙트는 `CV.on` 이면 **전장 캔버스** (`CVF.under/over` · `fxRing` · `FXC.beams`) · 큰 원 · 긴 빛줄기 · 여러 유닛을 잇는 선은 DOM 금지 · 이펙트 DOM 은 `S.fast` 일 때 만들지 않고 끝나면 지운다 (`u.fx` 에 넣으면 자동).
- WebGL 층 (`GLC`) 은 원 · 빛 · 글씨만 그린다 → 경로 · 그라데이션 · clip 을 쓰는 이펙트는 2D 층. **새 이펙트 좌표는 `W.x(x, y)` · `W.y(x, y)`** (3D 원근).
- 넓은 범위 스킬 피해 숫자는 `dealDamage(..., { skill: true, lite: true })`.
- **`will-change` · transform 붙은 요소를 전장 좌표 크기로 크게 만들지 않는다** (폰 GPU 메모리 초과 깜빡임) · **전장 위 HUD 에 반투명 opacity 를 주지 않는다** (폰에서 깜빡임).
- 확인: `?bench=50&ids=<지후,…>` (FPS · 최악 프레임 · 계산 ms) · 데스크톱은 렉이 안 보이니 CPU 스로틀 ×4 · ×6 으로 비교.

## 전투 엔진 핵심
- 전투 난수는 `rng` 하나만 (친선전 두 화면 · 리플레이가 같아야 한다) · **전투 코드에 `Math.random` · `Date.now` 금지**. 연출 · 뽑기는 `Math.random`.
- 스킬 도우미 `A` (`A.dmg` · `A.status` · `A.buff` · `A.line` · `A.zone` · `A.boom` · `A.knock` · `A.later` 전투 시간 예약 · `A.transform` · `A.spawnChild`) · 훅: `onStart` · `tick` · `customAttack` · `onHit` · `onKill` · `onUnitDeath` · `onLethal` · `onDamaged` · `onCrit` · `steer` · `takenMult` · `atkMult` · `ivOf` (공격 간격) · `pickTarget` · `gauge` (**스킬 있는 지후에 gauge 를 달면 SP 막대 대신 그게 보인다**).
- 즉사는 `instaKill(src, t, label)` · 피해는 `dealDamage` (받는 피해 감소 최대 90% · 최소 1) · 체력 비례 피해는 `pctD(t, v)` 로 감싼다 (성 5% 한도) · 받는 피해 버프 키 `tk` · SP 는 `skNeed(u)`.
- 투사체 `S.shots` · 관통탄 `S.lines` 는 맞는 순간 새로 쏜 것도 남도록 목록을 비우고 돈다 (다시 `filter` 한 번으로 바꾸지 말 것).
- **`u.ghost` 면 물리가 안 움직인다** → ghost 이동은 위치를 직접 바꾼다 · 성뿌수기 · 디펜스는 쓰러진 유닛을 2.5초 뒤 `S.units` 에서 치운다 (오래 들고 있는 코드는 깨진다 · 새 소환은 `cwFull` 확인).
- 전장: 가로 (`isEW()` · 릴스만 세로) · 진영마다 세로 3 (`CFG.COLS`) × 가로 5 (`CFG.ROWS`) = 15칸 · `ROW_KIND` [0 전열, 1, 1, 1 중열, 2 후열] · `MAX_UNITS` 15 · 라운드 60초 · 레벨은 경기 안에서만 (최대 Lv5 · `CFG.LEVEL_ADD` 0.25) · 출격제한 `OVL_LIM` (넘치면 패시브 · 스킬 없음).
- 랭크 (A · A+ · S · SS · SSS · `ENH_MAX` 5 · 이름 `rkN` · **숫자로 보여 주지 않는다**) · S 고유능력 `enh6(u)` (이름은 그대로 · 랭크 3 이상) · SSS 필살기 `ULT` · 「랭크마다」 수치는 `rkX(u)`.

## 게임 규칙 요약 (수치는 코드가 기준 · 여기 숫자가 낡으면 코드를 믿는다)
- 모드: 일반전 (봇 · 온라인 대기열) · 친선전 (온라인 1:1) · 아케이드 (미러전 · 랜덤전 · 지후의 탑 · 경쟁전) · 샌드박스 · 이벤트 모드 (일반전 토글). 디펜스 · 성뿌수기는 임시로 숨김 (코드는 있다).
- 덱 5기 · 등급 일반 / 희귀 / 영웅 / 전설 · 모집 `CFG.GACHA` (지금 전설 2.5 · 영웅 4 · 희귀 10 · 일반 83.5) · 천장 80 · 픽업 · 중복은 조각 · 랭크업 = 조각 + 골드 (`RK5.SH` · `RK5.G`).
- 토큰제 (`TOK` · 라운드 지급 `TOK.BASE` · 업그레이드 `TOK.UPS` · `tokCost` · `TOK_COST`) · 봇 난이도 1~10 (`BOT_D` · 유저 MMR `mmr()` · `botDPick`) · 봇 덱 `botTierDeck` · 봇 랭크 `botRanks`.
- 배속: 누구나 1.5배 · VIP 2배 · 25초 뒤 자동 1.5배.
- 화면: 로비는 **ui4** (화이트 · 그레이 · 블랙 미니멀 · 기본 켜짐 · `?ui4=0` 이면 ui3) · 값은 ui3 것 (`u3Vals` → `u4Extra`) · 템플릿 `ui4Tpl` · CSS 는 `--u4-*` 변수와 `u4-` 클래스 (**새 UI 에 인라인 색을 쓰지 않는다**) · `#ui2` 밖 창은 `body.u3-on` 테마를 ui4 로 덮어 쓴다.

## 세계관 (서사를 쓸 때)
- 지후들이 사는 **지후왕국**. 국왕 **화염 지후 1호** · 오른팔 **물 지후**. 같은 종류도 1호 · 2호 … 여럿.
- 메인 스토리: 황사 지후의 「황사회주의」 지령으로 서쪽 마을 **화염 지후 314호**가 반란 → 소탕군 지원자는 암살 · 쉴드 · 검 · 얼음 넷뿐.
- 자주 쓰는 연결: 왕궁 (근위대장 수호자 · 의원 주사 · 금고 티타늄 · 시계방 시계 · 천문대 별) · 블리자드 ↔ 태양 · 얼음 ↔ 블리자드 (펜팔) · 촉수 ↔ 죠스 · 라이플의 러시안룰렛 트라우마 · 포식이 남의 음식을 먹어 치움 · 조커가 슬롯머신을 털었음.
- 지후마다 자세한 연결은 기록 파일의 「세계관 · 서사」와 각 지후의 `story` 를 grep.

## 계정 · 서버 (짧게)
- Firebase 프로젝트 `jihoobattle` · 게스트는 익명 인증 · 기록 `r2_backups/<uid>` · 이 기기 `rejhbt.profile.v1`.
- 서버 기록 맞추기: 저장 번호 `profile.bkWid` / `profile.syncWid` (`serverNewer` · `bkConflict` · `bkPick`) · 저장 시각은 비교에 쓰지 않는다.
- **프로필 정규화 (`normProfile`) 가 보는 데이터 (`ITEMS` · `FRAMES` · `MQ` · `RK5` …) 는 `let profile = loadProfile()` 보다 앞에** 둔다 (뒤에 두면 TDZ 오류로 켜지지 않는다).
- 프로필을 한 번 옮기는 변환은 플래그로 (`p.rk5` · `profile.artC` · …) — 서버의 옛 기록이 들어와도 다시 맞게 바뀐다.
- 매일 보상 · 날짜는 **`todayKey()` · `stDay()` (한국 시간 · 서버 시간)** 로 (`new Date()` 로 날짜를 만들지 않는다 · 기기 시간대를 바꿔 무료 모집을 무한으로 돈 유저가 있었다).
- 보상 · 소비 함수를 새로 만들면 맨 앞에 `alWhy('이유')` (활동 기록).
- 운영: 운영자 `admins/<uid>` · 정지 `bans/<uid>` · 점검 `config/maintenance` · 로비 공지 `config/announce` · 화면 위 띠 `config/bcast` · 운영 우편 `giftMail` (모르는 보상이 든 우편은 남겨 둔다 · `giftOk`) · 개발자 도구 `#opModal` (`opOpen(탭)` · 새 운영 기능은 여기에 탭으로) · 욕설 검사 `hasBad` (금지어를 늘리면 rules 의 `cleanName` 도).
- `dlg` 가 다른 dlg 에 밀리면 `null` — 꼭 골라야 하는 창은 null 이면 다시 묻는다.

## 안드로이드 앱 (APK)
- **Capacitor 7** · `app/` (패키지 `kr.jihoobattle.app` · 바꿀 수 없음) · 게임 파일을 APK 안에 넣는다 → 업데이트마다 새 APK.
- 만들기: `cd app` → `npm run sync` (`tools/app-sync.js`) → `cd android` → `JAVA_HOME=<JDK 21> ./gradlew.bat assembleRelease` → `app/android/app/build/outputs/apk/release/app-release.apk`.
- **새 APK 마다 `app/android/app/build.gradle` 의 `versionCode` +1 · `versionName` = 게임 버전.**
- 도구 (저장소 밖): JDK 21 `C:/Users/User/AppData/Local/jhbt-android/jdk` · Android SDK 35 `…/jhbt-android/sdk`.
- **서명 키** `C:/Users/User/Documents/jhbt-app/jhbt-release.jks` + `keystore.properties` (git 에 안 올림) — **잃어버리면 같은 앱으로 업데이트를 못 낸다.**
- 게임 안 `IS_APP`: 서비스 워커 없음 · 새 버전 확인은 `APP_SITE` 와 비교 · 구글 로그인 막음 · 앱 저장은 브라우저와 따로.
- 로컬 파일 (아이콘 · 효과음 · 유물 그림 …) 을 더하면 `python tools/sw_assets.py` 로 오프라인 CORE 를 다시 만들고 `sw.js` 의 `CACHE` 끝 숫자를 올린다.

## 주기적 코드 리뷰 · 리팩터링 (`tools/review/` · 자세한 순서는 그 폴더 README)
- **동작을 바꾸지 않는 정리만**: 고치기 전 고정 시드 전투 120판 (`tools/tierlist/run.js`) 을 저장 → 정리 → 같은 시드 결과가 `cmp` 로 완전히 같아야 한다 + 첫 로딩 · 벤치 · `comment-check.py`.
- `python tools/review/survey.py` (안 쓰는 함수 · 변수 · CSS 클래스 · 머리말 없는 구간 — 알려만 준다) · `css-prune.py [--dry] <클래스 …>` · `toc.py` (스크립트 맨 위 목차를 `// ═════════ 제목` 머리말로 다시 쓴다 — 큰 구간을 만들면 머리말을 달고 돌린다).
- 이름을 조립해 쓰는 CSS (`r-<등급>` · `tier-<티어>` · `g1` 등) 는 안 쓰는 것처럼 보여도 지우지 않는다.

## ⚠️ 작업하다 겪은 함정 (꼭 읽기)
- **`index.html` 은 줄바꿈이 섞여 있다 (CRLF · LF).** 파이썬으로 고칠 때 반드시 `open(P, encoding='utf-8', newline='')` 로 읽고 쓴다 (안 그러면 diff 가 2만 줄). **Edit 도구도 섞인 줄바꿈을 한쪽으로 바꿔 버린다** → `index.html` 은 파이썬 치환으로 고친다 (작은 파일 · 도구 스크립트는 Edit 써도 된다).
- **치환 스크립트 패턴**: `r(old, new, cnt=1)` 목록을 만들고 `s.count(old) == cnt` 를 확인한 뒤 바꾼다 (하나라도 안 맞으면 아무것도 쓰지 않고 멈춘다) · 여러 줄 old 는 `\n` 이 안 맞으면 `\r\n` 으로 한 번 더 찾는다. **치환은 순서대로 적용되니 앞 치환이 바꾼 줄을 뒤 치환이 원래 문자열로 찾으면 MISMATCH** → 같은 줄을 바꾸는 치환은 하나로 합친다.
- **⚠️ bash heredoc 함정**: `python - <<'EOF'` 안에 따옴표 · `\n` · 백틱이 많은 긴 파이썬을 넣으면 깨진다 (「unexpected EOF while looking for matching」 · `'\\n'` 이 진짜 줄바꿈이 되어 문자열이 끊김). **긴 패치 스크립트는 Write 도구로 scratchpad 에 `.py` 파일로 쓰고 실행**한다 · JS / CSS 덩어리도 따로 파일에 쓰고 스크립트가 읽어 넣는다.
- **`sleep` 을 앞에 붙인 명령은 막힌다** → 기다릴 일은 `run_in_background` 나 조건 반복으로.
- **커밋에 시험용 PNG 가 섞이지 않게** — 헤드리스 스크린샷은 scratchpad 에 저장한다 (cwd 가 저장소로 돌아오면 저장소에 떨어진다 · `git status` 로 확인).
- **3D 전장 위의 DOM 버튼은 바닥 칸에 가려질 수 있다** (솔렘 모드 버튼이 발밑이라 PC · 모바일 모두 안 눌렸다) → 버튼은 지후 머리 위 · 헤드리스에서 `elementFromPoint` 로 확인.
- **벤치 (`?bench=`) 시험의 한계**: 벤치 루프가 전장을 계속 다시 그려 실제 클릭 시험이 안 될 때가 있다 (`el.click()` 으로 핸들러만 확인) · `#boot` 를 지우면 부팅 코드 오류가 콘솔에 찍힌다 (시험 탓 · 무시) · 벤치 인트로 · 배너가 스크린샷에 겹친다.
- 헤드리스 시험 도구는 `tools/tierlist/run-cdp.js` 의 `open()` 을 가져다 쓴다 (소리 끔 · 바깥 주소 차단 · 새 프로필). 함수는 `window.__rejhbt` 에 개발 주소에서만 내보낸다 (필요하면 시험용으로 더한다).
- 서버에 쓰는 기능 (우편 · 매칭 · 접속자 · 공지 띠) 은 실서버로 시험하지 않는다 → 코드 · 규칙만 맞추고 「실서버 미확인 · 규칙 게시 필요」를 알린다.

## 토큰 아끼기 (작업 방식)
- **작업 하나 = 세션 하나.** 대화가 길수록 모든 턴이 비싸진다. 주제가 바뀌면 새 세션 · 이어서 할 일이 남으면 `docs/next.md` 에 할 일 · 함수 이름 · 막힌 점을 적어 두고 다음 세션은 그것부터 읽는다.
- **`index.html` 을 통째로 읽지 않는다** (10MB). 찾을 때는:
  - `grep -n "^function 이름\|^const 이름"` 으로 줄 번호만 → 필요한 줄만 `sed -n 'a,bp' | cut -c1-600`.
  - 긴 한 줄은 `grep -o ".\{0,80\}찾는말.\{0,120\}"` 처럼 앞뒤만.
  - **초상화 base64 줄 (`PORTRAITS` · 대략 8000~8300 줄 근처 · `data:image`) 은 grep 결과에서 빼거나 `cut -c` 로 자른다** — 한 번 걸리면 수천 자가 쏟아진다.
  - 여러 곳을 볼 때는 한 번의 명령으로 모아서 (`for` · `awk 'NR==a||NR==b'`).
  - 개수만 필요하면 `grep -c` · 존재만 필요하면 python `s.count(...)`.
- 지후 정의 · 도우미는 `CHARS` 의 그 지후 줄 + 이름으로 grep 한 함수만 본다 (전체 덤프 금지).
- 스크린샷은 꼭 필요할 때만 (한 장에 1,000~2,000 토큰) · 같은 화면을 반복해서 찍지 않는다.
- 사용자에게 받는 요청은 갈래가 섞여 있을 수 있다 → 패치 스크립트를 갈래별로 나눠 실패 범위를 줄인다.
- UI 리디자인: 작은 것은 레퍼런스 이미지 → 게임 코드 → 스크린샷 (캔버스 생략) · 큰 것만 디자인 캔버스 (ui4 변수 · 글꼴 · 1280×720 그대로 · 한 장만).

## 최근 변경 (R3.7 · 2026-11-26 · build 1)
- 리워크 4종 (세션을 나눠 각자 브랜치 → 합침): 사신 (`rpr*` · 봉인 · [망령] 6개 → 강림 · 낫은 캔버스 `rprDraw`) · 냉각 ([극지방] `S.pz` · 8초 감속 → 2.5초 빙결) · 마탄 ([스코프] · 필살기는 마탄 5발 `ultOk`) · 변이 (배치 기록 `p.mu` · 판정 없는 자리는 `mutKey` 로 rng 한 번).
- 수치 조정 16종 · 토큰 태양 8 · 불사조 6 · EMP 3 · 변이 2 (디펜스 8) · 더블딜러 빨간 카드 배율 `DD_RK`.
- 디펜스 정식: 베타 안내 · BETA 표시 삭제 · 열쇠 `df2KeyGive` (5웨이브마다 10 · `profile.df2Key`) · 10웨이브마다 `df2Wipe` · 머리 위 업그레이드 창 `df2UpTap` · `df2UpDraw` (`#df2Up` · Lv0 → 5 = 내부 Lv1 → 6 · `DF2.UP` · 보이는 레벨 `lvShow`) · 준보스 `DF2.MUB` [3, 20] · 4배속 삭제 · 주마등 `artLast` 는 디펜스에서 꺼짐.
- 소식 `login` 의 b = `new` · `m<분>` · 떠남 `leave` (`presLeave` · pagehide · 로그아웃) · 리더보드 접속 시간 `pt` (`profile.playM` · 화면이 켜진 1분마다) — **규칙 게시 필요** (events leave · r2lb pt).
- 업데이트 안내 창 ui4 디자인 · 오늘의 픽업 해시가 음수 → 화염 지후 버그 (`puToday`) · 듀얼리스트 [최후의 결전] 동안 스킬 초상화 (`u.dlSkT`).

## 최근 변경 (R3.6 · 2026-11-25 · build 1~6)
- **build 6 밸런스**: 소울스틸러 영혼 공격력 +10% · 최대 체력 +2% (`SS.KA` · `KH`) · 여러 기면 `ssDrop` 이 맨 앞 한 기만 `rng()` 로 한 기에게 나눠 준다 · 디펜스 웨이브마다 `SS.LOSE` 75% 잃음 / 갓지후 토큰 4 · 트루폼 [심판의 빛] 삭제 → `godBeamTF` (`GOD_TF` · 폭 0.45칸 · 맵 끝까지 · `pure` 9999 · 공격속도 `ivOf` + `fixAspd` 1.6초) · `godRay*` 는 안 쓴다 / 사이보그 공격력 75 · `CB.T` 22 (랭크 S 20) · 광자포 뒤 `LOCK` · 가속 초기화 삭제 / 도깨비불 `DK.STEAL` 22%. 디펜스 비용 `DF2_TOK` 갓지후 25.
- **새 디펜스 (타워디펜스형 · 초안)** `// ═════════ R3.6 새 디펜스` · 설정 `DF2` · 적 도감 `DF2_FOES` (SUMMONS 에 등록 · 얼굴은 `df2Pic` SVG) · 구성 `df2Plan` · 한 스텝 `df2Step` (`dfStep` 맨 앞에서 `S.cw.v2` 로 갈라짐 · 예전 DF 코드는 남아 있지만 안 쓴다) · 적은 아군과 부딪히지만 `invMass 0` (무한 질량). build 2: 클리어 0.5 · 1~20웨이브 예산 ×0.6 → 1 (`DF2.EASY` · 적 수가 준다) · 두꺼운한철 `hpSet` 2,000 · 보스 쿨타임 2배. build 3: 클리어 1 · 처치 최소 0.2 · 10 · 20웨이브 보스 체력 절반.
- **build 3**: 도둑 리워크 (`burglarTake` · `onUnitDeath` 로 쓰러진 적의 스킬 · 기다리는 동안 `steer` 로 멈춤 · `burglarWait` 은신한 도둑만 남으면 풀림 · 예전 `burglarSteal` 은 안 쓴다) · 필살기 버프 `ULT_BUFF` 7.5 · 7.5 · −10% · `ULT_T` 5 · iPad 지후 탭: 로비 1초 `u2Render` 를 스크롤 · 터치 1.2초 안에는 쉰다 (`UI2.busy`).
- 화면은 성뿌수기 틀 (`cw` 클래스 · 왼쪽 패널) 이 아니라 **일반전 h4 화면 + `df2` 클래스** (`h4On` · `ubWant` 가 새 디펜스를 허용) · **전용 바 `#df2Hud`** (`df2BarInit` · `df2BarHud` · 토큰 · 지후 수 · 소환 타일 5개 · 숫자키 1~5 · Esc · 일반전 #pool · #tokBar 는 숨김 · `viewInsets` 가 바 높이만큼 전장을 올린다 · ⚠️ 일반전 부품을 가져다 쓰지 말 것 — 사용자: 새 게임처럼) → 전장 내 칸 (`df2Field`) = 소환 자리 · 지후는 자유롭게 움직인다 · 로스터 `c.ros` 최대 15 (쓰러진 지후 포함 · 다음 웨이브 부활) · 고른 타일 `c.sum` (⚠️ `c.pick` 은 예전 정비 시간 = 루프가 시간을 멈춘다) · 칸 = 언제나 새로 소환 · 칸 밖의 같은 지후를 누르면 업그레이드 `df2Up` (비용 × 2^(Lv−1)) · 적 체력 모두 ×3 (`DF2.HPA`) · 두꺼운한철부터는 거기에 ×2.5 (`DF2.HPK` · 구성 · 보상은 원래 체력 `hp0`) · **베타** (보상 · 리더보드 · 7일 퀘스트 없음 · 입장 무료 · 처음 한 번 안내 `df2Start` (`profile.dfBetaOk`) · 결과 `df2End` · 최고 기록은 `profile.dfBeta` — 정식 `dfBest` · `DF_RW` 와 따로) · 도감은 만난 적만 공개 (`profile.dfSeen` · 나머지는 실루엣 `DF2_SIL` · 운영자 `DEV.op` 는 전부 공개) · 디펜스 개발자 바 `df2Dev` (아무 지후 · 토큰 +50) 는 운영자 개발자 모드 `devOn()` 에서만 · 디펜스 전용 토큰 `DF2_TOK` · `df2Cost` (최소 2 · 표에 없으면 2) · 출격제한 (`OVL_LIM`) 은 로스터 기준 `df2Ovl` (소환 · 업그레이드마다 다시 판정 · 쓰러진 지후도 자리 차지) (측정 방법 · 전체 점수 `docs/defense-scores.md` · 새 지후를 더하면 같은 방법으로 재서 넣는다) · 라이프 5 · 위 기지 게이지 `#df2Base` (`#hudOdds` 숨김) · 충격파 `df2Quake` (내 유닛 15 초과 → 3초 → 1/3 · 쿨 5초) · 웨이브마다 새로 태어나기 `df2Reborn` (위험군 누적 초기화) · 체력 비례 ×0.25 (`pctD`) · 즉사 → 최대 체력 20% (`instaKill`) · 플라잉 공중 그리기 (`cvDraw0` · `df2FlyShadow`) · 보스 지후 10종 `DF2_BOSS` (10웨이브마다 무작위 · 스킬 `df2BossCast` · 2초 뒤 · 쿨타임 · 받는 피해 `df2Taken` (dealDamage) · SP 감소 `u.dfSpT` (evSp) · 그림 `DF2_PIC` (사용자 그림 24장 · 흰 배경 256 · 원본 `지후초상화/디펜스/<id>.png` · 이미 왼쪽을 보는 그림은 미리 좌우 반전 — 적은 전장에서 뒤집혀 그려진다) · 흑화 검은 삭제 (라이플이 15웨이브)) · 적 도감 `df2CodexOpen` (햄버거 메뉴 「적 도감」 · 서사 `DF2_STORY` · 메인 스토리 = 한철 마을 · 한철 1호 · 친철파) · 오른쪽 아래 SQUAD (#ubar) · 필살기 있음.

## 최근 변경 (R3.5 · 2026-11-24 · build 1~13) — 자세한 내용은 `docs/CLAUDE-history-2.md`
- **토큰**: `TOK.BASE` [6, 5, 5, 6, 6, 7, 7] (그 뒤 7) · `UPS` [2, 3, 5, 8, 11] · 데스매치 추가 없음 (`DM` 0).
- **랭크 개편 (build 2)**: 5랭크 · 비용 `RK5` · 옮기기 `rk5Move` (`p.rk5`) · 초기화권 우편 `rk5Mail` (`RK5.END` 12월 8일 · 우편 보상 `{ kind: 'item', key }`) · 봇 ±1 · 탑 봇 S · 15층부터 SSS.
- **필살기 (build 2)** `// ═════════ R3.5 build 2 필살기` · `ULT` · `u.ult` · 남은 쿨타임 `p.ut` · `ultStep` (stepCombat 맨 앞) · 내 지후는 아래 카드 줄 (`#ubar` `.hu` · 준비 `.ur`) 을 눌러 `ultTap` · 카드 줄이 없으면 자동 · 봇 · 시뮬 자동 · 리플레이는 RP 라운드 `u` 기록 · 컷인 `ultCut` (모서리만 자르고 왼쪽 아래 띠 · 사용자 요청) · 친선전 · 성뿌수기 · 디펜스는 없음.
- **유물**: 그림 `icons/art/<id>.png` · 카드 격자 + 상세 창 (`artDetail` · 다음 레벨 증가량 `artFx`) · **모은 개수 `profile.art`** (Lv n → n+1 에 n+1 개 · `artCum` · `artLv` · `artProg` · `artC` 변환) · 발굴 연출 `artDig` 2초.
- **운영자 메시지** `bcShow` (`config/bcast` · 보낸 운영자 화면에도) · **접속 중인 유저** `pres/<uid>` (`presBeat` · `presOpen` · 소식 창 탭 · 접속 수도 `pres` 로) · 접속 소식 events `login`.
- **업데이트 안내 창** `updDraw` (가로 2단 · 분류 탭 · 하이라이트 · 보상 칸 · 보상 `CFG.UPD_DIA` 300 + 곡괭이).
- **봇 난이도 1~10 (build 6~8)**: `BOT_D` · 유저 MMR (`profile.mmr` · Elo · 기대 승률 65%) · `botDPick` · 봇 덱 통계 `botstats` (개발자 도구 「봇 통계」 · 규칙 게시 필요).
- **지후 탭 리뉴얼 (build 9~13)**: 왼쪽 무대 `.u4-stg` · 오른쪽 카드 `.u4-cc` (등급색 `--rc` · `--u4-r0~r4`) · 아래 덱 트레이 `.u4-tray` · 필터 (등급 · 역할군 · 상태 · 검색 `u3q`) · 필살기 카드 `.u4-cc.ult::after` (아래 테두리 보라 그라데이션) · 모서리 2~4px (사용자: 각진 게 좋다).
- 리워크 · 밸런스: 더블딜러 · 부두술사 · 낚시 ([회치기] `p.fk`) · 변이 (R1 로직) · 솔렘라멘트 (합체 토큰은 `r6Grow` 맨 앞 · [구원] Lv2 · [장례] Lv3) · 마탄 (`MG` · 표식 `mgmk` · 최대 체력 `p.mgp`) · 엑시노스 칩 주기 · 랭크 6 (= S) 고유능력 16종.
- `buffSum` 은 스테인리스의 음수 `tk` 를 뒤집지 않는다.

## 미뤄 둔 일
- 길드는 사용자 요청으로 아직 만들지 않았다 (만들 때: 생성 ●20,000 · 탈퇴 뒤 24시간 재가입 · 최대 5명 · 길드마스터 / 부길드마스터 · 폭파 · 길드 랭킹은 길드원 전투력 합). 전투력 · 리더보드 cp 탭 내용은 `docs/CLAUDE-history.md` 「R2.21」.
- 「build 는 배포 때만 올리기 · 맘에 안 드는 것은 `docs/next.md` 에 쌓기」 규칙은 사용자가 보류 중 (2026-11-25).
