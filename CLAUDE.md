# RE : 지후배틀 (RE:JHBT) — 작업 규칙

> **⚠️ 대답은 무조건 한국어로 한다** (대답 · 코드 주석 · 커밋 메시지 · 패치노트 · 보고). 생각은 한국어로 옮길 필요 없다.

> 이 파일은 매 턴 통째로 읽힌다 → **규칙 · 방법 · 함정만** 둔다. 연혁 · 예전 수치 · 함수 이름은
> `docs/CLAUDE-history-2.md` (R2.21 ~ R3.6) · `docs/CLAUDE-history.md` (R2.18 까지) 에서 **필요한 부분만 grep**.
> 「최근 변경」은 맨 아래에 **최근 2개 버전만** · 그보다 오래된 것은 history-2 로 옮긴다 (2026-11-26 압축).

## 꼭 지킬 것
1. **작업 전에 이 파일을 읽는다.**
2. **작업이 끝나면 디스코드 공지용 인포그래픽을 만든다** (「인포그래픽」). 잠수함 패치는 제외.
3. **신규 지후가 나오면 신규 지후 인포그래픽도 · 서사(`story`)가 없으면 서사도.**
4. 기본은 **main 에 머지까지** (작업 브랜치 → 커밋 → main 머지). 푸시는 보통 사용자 (사용자가 「푸시해줘」 · 암구호 「ㅍ」 이면 내가). **끝나면 `main` 으로 돌아와 둔다** (작업 브랜치에서 사용자가 `git push` 하면 upstream 없음 오류).
5. **실서버 Firebase 에 테스트 계정을 만들거나 로그인하지 않는다.** 실제 계정 데이터를 건드리지 않는다 (`?bench=` · 로컬 프로필 · 헤드리스는 Firebase 주소를 막는다).
6. 올리기 전에 **빈 브라우저로 첫 로딩** 확인 (오류 없이 로비까지 · 아래 「브라우저 시험」).
7. **브라우저 시험은 소리를 끈다**: `localStorage` 의 `rejhbt-sfx-vol` · `rejhbt-bgm-vol` 을 `'0'` 으로 두고 새로고침 · 헤드리스 크롬은 `--mute-audio`.
8. **⚠️ 주석 사고** — 한 줄에 코드가 길게 이어지는 곳 (값 객체 · 한 줄 함수 · 템플릿 문자열) 에 `// 설명` 을 줄 중간에 넣으면 **그 뒤 코드가 통째로 주석이 되어 조용히 사라진다** (오류도 안 난다 · 여러 번 남).
   - 줄 중간 · 코드 앞에는 **반드시 `/* … */`**. `//` 는 그 줄의 진짜 맨 끝에만. 기존 줄 끝 `//` 뒤에 코드를 덧붙이지 않는다.
   - 수정 뒤 **`python tools/comment-check.py`** → 「의심 0줄」.
9. **⚠️ 인게임에 쓸데없는 서술 금지**: 카드 · 설명 · 배너 · 도감에 플레이에 필요 없는 말 (부연 · 괄호 속 덧말 · 등급 전용 표시) 을 붙이지 않는다. 짧게 · 핵심 수치만.
10. **⚠️ 패치노트를 지우지 않는다** — `comment-check.py` 가 버전마다 항목 수를 `tools/pn-count.json` 에 기록하고 줄면 실패 (일부러 지울 때만 `--pn-ok`).
11. **요청이 모호하면 정해서 하고, 정한 것을 대답에 적는다.** 되돌리기 어려운 것 (서버 · 계정 데이터 · 공지 올리기) 만 묻는다.
12. **규칙 (`firestore.rules`) 을 바꾼 작업은 끝날 때 「규칙 게시 필요」를 꼭 말한다** (게시를 잊어 기능이 안 보인 적이 많다).
13. **세션은 동시에 2개까지만** (사용자: 한도를 많이 먹는다 · 2026-11-26). 나눌 때의 방법은 「큰 작업 나누기」.
14. **⚠️ 브라우저 테스팅 등의 검증 작업을 절대로 오랫동안 하지 말 것** (사용자 · 2026-11-26). 불가피하게 하는 게 좋다고 판단되면 **아주 간편하게, 최대한 압축해서 초고속으로** 테스트한다. 다만 작업 범위가 매우 방대하고 코드 자체에서 문제가 생겼을 때는 제대로 해도 된다. **브라우저 테스트가 어떤 이유로든 실패하면 재시도는 최대 1번만** — 2번 실패하면 검증하지 말고 생략한다 (「확인 못 한 것」에 적는다). (아래 「브라우저 시험」·「작업별 가이드」의 검사 목록보다 이 규칙이 먼저.)

## 이름 · 버전 · 구조
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT** · 지금 **R3.8** (build 5).
- **버전은 하루에 한 번만** 둘째 자리 +1 (R3.6 → R3.7). 「하루」는 달력이 아니라 **사용자가 잠들기 전까지** (밤샘은 같은 버전 · 애매하면 묻는다). 같은 날 이어지는 패치는 `<meta name="jihoo-build">` +1 · 패치노트는 그날 항목 하나에 `추가 패치 (build N)` 칸을 맨 위에 더하고 title 을 그날 내용으로 고친다 (셋째 자리 R3.5.1 은 특별한 경우만).
- 버전 메타 `<meta name="jihoo-version">` (이름은 R1 과 같아야 한다 · 예전 화면이 새로고침 안내를 띄움).
- **같은 build 번호로 두 번 올리면 열려 있던 앱은 업데이트를 모른다** → 이미 푸시한 것을 고쳐 다시 올릴 때는 build 를 올린다.
- **잠수함 패치** (사용자가 「잠수함 패치」라고 하면): 패치노트 · 인포그래픽 · build 없이 코드만 커밋 · 머지 (커밋 메시지 머리 「잠수함:」).
- `index.html` 하나가 게임 전체 (빌드 없음 · 약 10MB · 초상화 base64 포함). 로컬: `python -m http.server 8766` → `index.html?bench=` (로그인 없이 · 시험 함수 `window.__rejhbt` · 개발 주소에서만).
- R1 (v8.1) 코드: `git show origin/archive/v8.1:index.html`.
- **사이트 배포 (GitHub Pages · jihoobattle.kr)**: `_config.yml` 의 `exclude` 로 게임에 안 쓰는 폴더 (infographics · tools · docs · app · 지후초상화 …) 를 뺀다 (225MB 가 되자 10분 제한으로 실패했었다) · 큰 폴더를 새로 올리면 여기에 더한다. 상태: `https://api.github.com/repos/wwwsebon-cloud/JHBT/actions/runs` · 사이트 버전 `curl jihoobattle.kr` 의 `jihoo-version`.
- **서버 규칙** `firestore.rules`: 사용자 PC 에서 **`node tools/rules-deploy.js`** (서비스 계정 키 · `문서/jhbt-app/rules.json` · `--dry` 로 차이만) · 콘솔에 파일 전체를 붙여 넣어도 된다.
- **사용자가 터미널 없이 GitHub 웹으로 `index.html` 만 올리는 때가 있다** («Add files via upload») → 다음 작업 시작에 `git fetch` → fast-forward → 패치노트 개수 확인 → 빠진 문서 · 인포그래픽 · 총정리를 채운다.

## 업데이트 때 할 일
1. `index.html` 수정 — `CHARS` 수치와 함께 `passive` · `skill.desc` · `atkText` · `CHAR_INFO` (도감) · 랭크 S `enh6` 설명 · 팁 (`TIPS_MORE` · `BOOT_TIPS`) 의 숫자도 같이. 토큰은 `CHARS[id].tok` 가 먼저 · 없으면 `TOK_COST` · 디펜스는 `DF2_TOK`.
2. 버전 / build 메타.
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new · buff · nerf · adjust · rework · fix · system · 지후가 아니면 `{ icon, name, tag, desc }`).
4. 검사: `python tools/comment-check.py` · 스크립트 문법 (큰 `<script>` 를 뽑아 `node --check`) · 헤드리스 전투 · 첫 로딩.
5. 인포그래픽 → 커밋 · 머지 → 사용자에게 PNG 보내기 (`SendUserFile`).
6. 이 파일 맨 아래 「최근 변경」 갱신 (최근 2개 버전만 · 모든 세션이 알아야 할 것은 위쪽 규칙 칸으로).

## 인포그래픽 (`infographics/`)
- **순서** (로컬 서버를 켠 뒤): `node infographics/extract.js` → `node infographics/notes2json.js <버전>` → (덱 JSON 손보기) → `python infographics/make.py infographics/<버전>.json` → `CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe" python infographics/shot.py "infographics/<버전>*.html"`. 파이썬 출력이 cp949 오류면 `PYTHONIOENCODING=utf-8`.
- **build 마다**: 맨 위 칸만 남긴 `<버전>-bN.json` 으로 make · shot.
- **덱 레이아웃 (기본)**: 흰 바탕 · 1080 × 1350 (4:5) 여러 장 (`build_deck`) · 표지 (버전 · 「오늘 바뀐 것 N가지」 · 「그 밖에」 칩 10개까지) → **큰 사건 두 개씩 한 장** (`"headlines": [{title, icon, color: orange|blue|purple|green|yellow, lead, points: [{big, small}] 4개까지, chars}]` · **ink 색은 한글이 안 읽혀 쓰지 않는다**) → 밸런스 타일 (`"tiles"` · 3열 × 11줄 · 넘치면 「(계속)」 장) → 「그 밖에」 (`"more": [{icon, title, line}]`). 큰 사건은 내가 고른다 (같은 주제를 묶는다). 예: `infographics/R3.7.json` · `today-2026-11-25.json`. 예전 남색 한 장은 JSON 에 `"layout": "classic"` · `shot.py` 는 `info-height` 가 있으면 자르지 않는다. **인스타그램 캐러셀은 10장까지.**
- notes2json 이 만든 JSON 은 `sections` 형식 → 덱으로 바꿀 때 `tiles` 는 sections 의 `balance` 타일을 옮긴다.
- **타일 규칙**: 패치노트 항목마다 tag 를 따로 (nerf 빨강 · buff 초록 · adjust 는 방향 없는 글 타일) · 설명에 ` · ` 를 쓰면 타일이 나뉜다 (나뉘면 안 되면 「와」 · 「(…)」) · 넘치면 문구를 짧게 · 글꼴 Lilita One + Do Hyeon.
- **headline 제목에 ` · ` 를 쓰지 않는다** (Threads 짧은 글에서 잘린다 · 「와」로).
- **신규 지후**: `node infographics/notes2json.js <버전> --new` → make · shot. **새 지후는 `make.py` 의 `NAMES` 와 `infographics/portraits.json` 에도 넣는다** (안 넣으면 초상화가 빈 원).
- 🛡 · 🆕 처럼 그림 글꼴에 없는 이모지는 빈칸으로 나온다 → 다른 이모지로.
- **하루 총정리** `today-<날짜>.json` (사용자가 오늘은 끝 · 잔다 · 총정리하라고 할 때 · 새 모드는 최종 상태 · 밸런스는 `node infographics/balance-sum.js <처음> <마지막>` 결과에서 고친 타일 · 지저분한 지후는 `balance-sum.js` 안 `OVERRIDE`).
- **티어표**: `"type": "tierlist"` · `infographics/tier-<버전>.json`.
- **게임 스크린샷을 넣지 않는다** (`"shots"` 안 씀). 리눅스에서는 `CHROME` 에 `--no-sandbox` 래퍼.

## 공지 올리기 (디스코드 · Threads · 인스타그램)
- **밀린 공지는 `node tools/post-all.js`** (`--list` 확인 · `--dry` 그림과 글 미리보기 · 묻고 올림 · `--yes`): 올릴 곳마다 마지막으로 올린 것 다음부터 지금까지를 합친다 → build 덱들을 `infographics/sum-<버전>-b<처음>-<끝>.json` 으로 합쳐 그림 → 커밋 · 푸시 → 올리기. 큰 사건을 직접 고를 때는 그 JSON 을 고치고 `"keep": true`. 딸깍 패치기 「안 올린 것 모아 올리기」 · 바탕화면 `Discord Thread.bat` 도 이것을 부른다. 「올려줘」라고 해도 미리보기를 보여 주고 확인받는다.
- `node tools/post-patch.js` — 맨 위 패치노트 (그날 마지막 build 칸 · `--all` 은 버전 전체) 글 + 인포그래픽 → 디스코드 (웹후크) · Threads (500자 → 항목 이름만 · 캐러셀) · 인스타그램 (`--ig-token` 이 있을 때 · 지금은 토큰 없음 · `--only instagram` · JPEG 4:5 조각 `tools/ig-slices.py` → `infographics/ig/<이름>-ig<N>.jpg` 최대 10장).
- **이미지는 GitHub raw 주소로 받으니 커밋 · 푸시한 뒤에** 올린다 · `--dry` 로 확인. ⚠️ 푸시 전에 `--dry` 로 raw 주소를 열어 보면 CDN 이 404 를 몇 분 기억한다 → 푸시 뒤 주소가 200 이 될 때까지 백그라운드로 기다렸다 올린다.
- 설정은 저장소 밖 `문서/jhbt-app/post.json` (웹후크 · 토큰 · 올린 기록 `posted` — **내용을 출력하지 않는다**) · `--init` · `--threads-token` (20일마다 알아서 갱신) · `--discord-role <역할 ID>` (핑) · `--no-ping`.
- **매일 마지막 패치만 내가 올린다** (사용자 허락): 하루가 끝날 때 `today-<날짜>` 총정리 → 커밋 · 푸시 → **`node tools/post-patch.js --day`** · 다음 날 첫 작업에서 어제 `<버전>-day` 가 `posted` 에 없으면 먼저 올린다 · build 마다 · 잠수함 패치는 올리지 않는다.
- 웹 푸시 알림 (버전을 올린 업데이트만): 사용자 PC 에서 `node tools/push-send.js --key <서비스 계정 JSON>` (`--dry`).

## 바탕화면 `JHBT-도구.bat` (딸깍 패치기 · 배포 · 공지 — 사용자가 직접 누른다)
- `tools/patcher/server.js` → http://127.0.0.1:8790 (이미 켜져 있으면 그 창을 연다 · 코드를 바꿨으면 그 창을 닫고 다시).
- **「딸깍 패치」 탭**: 지후 검색 → 기본 스탯 · 토큰 · 상수 · 도우미 함수 · 필살기의 숫자와 설명 글 (passive · skill.desc · CHAR_INFO · 랭크 S) → 고치면 글자 위치 그대로 넣고 (`core.js` `apply`) → 주석 · 문법 검사 (실패하면 되돌림) → 잠수함 / build +1 (그날 패치노트에 「추가 패치 (build N)」) / 새 버전 → main 커밋 → (푸시).
  - 숫자 이름은 앞뒤 코드로 짐작 (`guess` · 줄임말 `ABBR`) · 사용자가 이름을 누르면 바꿔 `tools/patcher/labels.json` 에 저장 (커밋한다).
  - 지후의 도우미는 「이 지후 근처에서만 쓰는 이름」 (함수 10번 · 상수 45번 이하 · 두 단계) → 공용 함수 숫자는 안 나온다 (일부러).
- **「배포 · 공지」 탭** (`jobs.js` · 한 번에 하나 · 기록을 0.7초마다 가져감): 지금 상태 (버전 · 안 올린 커밋 · 커밋 안 된 파일 · 인포그래픽 미리보기) · 한 번에 (인포그래픽 → 커밋 → 푸시 → 규칙) · 인포그래픽 (**자동판 = notes2json 남색 클래식** · 이미 있으면 「덮어쓰기」를 켜야 다시 · 내가 만든 덱이면 끈 채로) · 푸시 · 규칙 (차이 보기 / 게시) · 공지 (디스코드 · Threads · 인스타 · 하루 총정리 → **미리보기를 본 뒤에만 「이대로 올리기」**) · 티어리스트 (일꾼 2 · agg · apply · make · shot · 커밋).
- 시험은 다른 포트로: `PORT=8798 NO_OPEN=1 node tools/patcher/server.js` · 적용 시험은 worktree 에서 `JHBT_BRANCH=<브랜치>` (main 이 아닌 브랜치 허용) · 진짜 게시 · 공지 버튼은 시험에서 누르지 않는다 (미리보기 · `--dry` 만).

## 큰 작업 나누기 (세션 · 브랜치)
- 세션은 **동시에 2개까지**. 나눈 세션은 각자 worktree 브랜치에 **자기 지후 코드만** 바꾸고 커밋만 (머지 · 푸시 안 함).
- **공용 표는 메인 세션만**: 버전 · build 메타 · `PATCH_NOTES` · 토큰 (`tok` · `TOK_COST` · `DF2_TOK`) · `TIER_SC` · `CLAUDE.md` · `infographics/`. 안 그러면 머지 충돌.
- 같은 `CHARS` 줄 (체력 · 토큰이 한 줄) 을 메인과 세션이 같이 고치면 충돌 → 그 줄의 토큰은 세션 브랜치를 합친 **뒤에** 메인이 바꾼다. 충돌 해소는 양쪽 줄을 눈으로 보고 줄마다 고른다 (`<<<<<<<` 를 파이썬으로 풀 때 어느 쪽 몇 번째 줄인지 확인).
- 세션 브리프에 넣을 것: 이 파일 읽기 · 파이썬 `newline=''` 치환 · 건드리지 말 것 목록 · 검사 방법 · 마지막 보고에 **패치노트 문구 · 정한 것 · 확인 못 한 것**.

## 브라우저 시험 (헤드리스 · 막히기 쉬운 곳)
- **먼저 「꼭 지킬 것」 14번**: 짧게 한 번에 끝낸다 (여러 화면 · 반복 측정을 늘리지 않는다).
- 도구: `tools/tierlist/run-cdp.js` 의 `open()` 을 가져다 쓴다 (소리 끔 · 바깥 주소 차단 · 새 프로필): `src.slice(0, src.indexOf('const [W, shardS'))` 를 `new Function('require', head + '; return open;')(require)`. 전투만 볼 때는 `?bench=2` 에서 `tools/tierlist/harness.js` 를 넣고 `__tl.fight(팀A, 팀B, 시드)` (배치 · UI 없이 빠르다).
- **빈 프로필로 `index.html` 을 열면 차례로 막힌다** → 순서대로 넘긴다:
  1. 약 14초 뒤 「인터넷에 연결할 수 없어요」 (Firebase 차단) → 글자에 `오프라인` 이 든 보이는 버튼을 `click()`.
  2. 부팅 화면 「터치하여 시작」 (`b4St`) → 그 글자가 든 요소를 `click()`.
  3. 새 유저 프롤로그 만화 (`.comic` 요소들) → `display:none` 으로 숨긴다 (또는 「건너뛰기」).
  4. 튜토리얼 · 안내 창이 남으면 `document.elementsFromPoint(x, y)` 로 무엇이 덮는지 보고 `#screen-battle` 을 품지 않은 `body` 의 자식을 숨긴다.
- **`window.__rejhbt.S` 는 낡은 참조다** (`newMatch` 가 `S` 를 새로 만든다) → **`__rejhbt.cur()`** 로 지금 `S` 를 얻는다. 시험에 필요한 함수는 `__rejhbt` 내보내기 줄 (`if (DEV_HOST) window.__rejhbt = {`) 에 더한다 (개발 주소에서만).
- `?bench=` 는 벤치 루프가 전장을 계속 다시 만든다 → 디펜스 같은 모드 시작 (`df2Start`) 이 덮어써져 안 된다 · 실제 클릭 시험도 안 될 때가 있다 (`el.click()` 으로 핸들러만 확인). 모드 시험은 bench 없이 위 1~3 을 넘긴 뒤.
- 덱이 비어 시작이 안 되면 `prof().deck` 과 `prof().owned` 를 시험용으로 채운다 (로컬 프로필만).
- 클릭이 실제로 닿는지: `elementFromPoint` 가 그 버튼인지 확인 (**3D 전장 위 DOM 버튼은 바닥 칸에 가려질 수 있다** → 버튼은 지후 머리 위).
- `#boot` 를 지우면 부팅 코드 오류가 콘솔에 찍힌다 (시험 탓 · 무시) · 벤치 인트로 · 배너가 스크린샷에 겹친다.
- **⚠️ 브라우저 시험이 실패하면 1번만 다시 하고, 2번 실패하면 그 시험은 생략**하고, 문법 · 헤드리스 전투 · 첫 로딩 같은 다른 검사로 대신한 뒤 「확인 못 한 것」으로 보고한다 (시간 · 토큰을 쏟지 않는다).
- 스크린샷 · 시험 PNG 는 **scratchpad 에** 저장 (저장소에 떨어지면 커밋에 섞인다 · `git status` 확인). 서버를 띄운 백그라운드 작업이 끝나며 exit 127 로 보고되어도 시험에는 영향 없다.

## 시뮬 · 티어
- **로컬 윈도우**: 서버를 켜고 `node tools/tierlist/run-cdp.js <폴더> <번호> <일꾼 수> <판수>` 를 일꾼 수만큼 (**일꾼 1~2개** · 12개는 PC 가 멈췄다 · 죽은 일꾼만 다시 · 이어하기 됨) → `node tools/tierlist/agg.js <폴더> 100` → `python tools/tierlist/apply.py <폴더> <버전> <날짜>` → make · shot.
- **클라우드 (리눅스)**: `tools/tierlist/run.sh <버전> [판수=1600] [병렬=4] [부트스트랩=100]`.
- 방식: 무작위 10기 5:5 · Lv1 · 60초 · 남은 체력 차이 · Bradley-Terry · k-평균 · 진영 바꿔 두 번 · 부트스트랩 · 지난 `TIER_SC` 와 비교 ▲▼ (자세한 건 `tools/tierlist/README.md`).
- `TIER_SC`: SS 90~100 · S 80~89 · A 65~79 · B 40~64 · C 20~39 · D 0~19 · 없으면 50. 표에서만 S 를 S · A+ 로 · 한 판으로 못 재는 지후는 ? (`UNKNOWN`) · 2티어 이상 ▲▲ · ▼▼ · 토큰 5 이상 금색 딱지.
- 같은 버전을 이어서 돌리면 agg 전에 `TIER_SC` 를 지난 티어표 값으로 되돌린다. **메커니즘을 바꾸는 중에 돌린 시뮬은 무효.**
- `apply.py` 가 `TIER_SC` · `infographics/tier-<버전>.json` · `tools/tierlist/history/` 를 쓴다.
- 지금 `TIER_SC` · `tier-R3.5` = R3.5 build 13 코드 · 1,600판 (R3.7 리워크 뒤로는 다시 재지 않았다).

## 신규 지후 체크리스트
- 초상화: **흰 배경 256×256 PNG** (투명 금지) → `PORTRAITS` (base64) · 원본은 `지후초상화/`.
- **시그니처 색**: `python tools/sig-color.py --sheet <확인표.png>` → `SIG_C` · **확인표를 눈으로 보고** 다르면 `SIG_FIX` 에 `'id': '#색'` (두 색 `'#a,#b'`) 후 다시.
- **토큰 `tok`**: 사용자는 3~4 지후만 정한다 · 나머지는 내가 (1 = 물량이 많아도 판도를 안 흔듦 · 2 = 대부분 · 3 = 살짝 비쌈 · 4 = 하나로 판을 바꿈) · 정한 값은 알린다. 디펜스 토큰 `DF2_TOK` 도 (`docs/defense-scores.md` 와 같은 방법).
- `CHARS` 끝에 추가 (도우미는 `reapFx` 앞 `// ── R3.x 신규 지후 도우미 ──`). 안 준 역할군 · 사거리 등은 정하고 알린다.
- `passive` · `skill.desc` 는 **쉽게 · ~니다 · 한두 문장** · 자세한 숫자는 `CHAR_INFO[id]` (버전명 · 「예전엔」 금지 · 지금 규칙만).
- **서사 `story`**: ~입니다 · ~해요 · 5~7문장 · **개그 · 병맛** (말도 안 되는 사건 · 반전 · 마지막 펀치라인 · 외양 묘사는 줄인다) · 지후왕국 세계관과 다른 지후를 엮는다. **AI 티 금지**: 인용문 금지 · 능력 숫자 금지 (세계관 숫자 1호 · 314호 · 3년은 괜찮다) · 능력 서술 최소.
- **전설이면 획득 소식 문구**를 `NEWS_LINE` 에 한 줄 (`{n}` = 닉네임 · 한 문장 · 개그) · 영웅 이하는 「○○ 지후를 뽑았습니다」라 필요 없다.
- 뽑기 · 덱 · 도감에 안 나오는 변신 지후 (`prince` 등) 는 `Object.defineProperty(CHARS, id, { enumerable: false })`.
- 새 상태 · 버프는 `STATUS` · `FX_OF` / `fxList` · `BUFF_SRC` · 매거진 `MZ_STC` · `MZ_STD` · 스테인리스 반전 `ST_REV` 를 정할지.
- 배치 기록 (`S.place[side][t]`) 에 새 필드를 넣으면 친선전 `packPlace` / `unpackPlace` 와 합체 (`moveTile` 의 `canFuse`) 에도.
- 불 · 얼음은 `FIRE_T` · `ICE_T` · 컬렉션 `COLS` · 인접 버프 `ADJ_BUFF`.
- 헤드리스 전투 (오류 · 이펙트 잔상) · **50기 이상에서도 프레임 드랍이 없게** (「성능 규칙」).

## 성능 규칙 (새 지후 · 새 이펙트)
- 이펙트는 **`transform` · `opacity` 애니메이션만** (`box-shadow` · `filter` · `border-color` · `background` · `width` 애니메이션 금지 · 큰 반투명 그라데이션 원을 매번 새로 만들지 않는다).
- CSS 에 **`[style*=…]` 선택자 금지**.
- DOM 위치 · 크기는 프레임마다 한 번 이하 (`tick` 은 한 프레임에 여러 번 · 바뀐 값만 · `translate`).
- 매 스텝 `A.status` · `A.buff` 를 다시 걸지 않는다 (걸려 있으면 남은 시간만 늘린다).
- 자주 생기는 이펙트는 `CV.on` 이면 **전장 캔버스** (`CVF.under/over` · `fxRing` · `FXC.beams`) · 큰 원 · 긴 빛줄기 · 여러 유닛을 잇는 선은 DOM 금지 · 이펙트 DOM 은 `S.fast` 때 만들지 않고 끝나면 지운다 (`u.fx` 에 넣으면 자동).
- WebGL 층 (`GLC`) 은 원 · 빛 · 글씨만 → 경로 · 그라데이션 · clip 은 2D 층. **새 이펙트 좌표는 `W.x(x, y)` · `W.y(x, y)`** (3D 원근). DOM 을 지후 위에 띄울 때 화면 좌표는 `proj3(x, y)` (`P3.m` 일 때 · `cvPick` · `df2UpPos` 참고).
- 넓은 범위 스킬 피해 숫자는 `dealDamage(..., { skill: true, lite: true })`.
- **`will-change` · transform 요소를 전장 크기로 크게 만들지 않는다** (폰 GPU 깜빡임) · **전장 위 HUD 에 반투명 opacity 금지**.
- 확인: `?bench=50&ids=<지후,…>` (FPS · 최악 프레임 · 계산 ms) · 데스크톱은 렉이 안 보이니 CPU 스로틀 ×4 · ×6.

## 전투 엔진 핵심
- 전투 난수는 `rng` 하나만 (친선전 두 화면 · 리플레이가 같아야 한다) · **전투 코드에 `Math.random` · `Date.now` 금지** (연출은 `Math.random` · 재화 · 지후 추첨은 `er('갈래')` (「계정 · 서버」)). 배치 때 정하는 무작위 (변이 성공작 등) 는 결과를 배치 기록에 저장한다.
- 스킬 도우미 `A` (`A.dmg` · `A.status` · `A.buff` · `A.line` · `A.zone` · `A.boom` · `A.knock` · `A.later` (전투 시간 예약) · `A.transform` · `A.spawnChild` · `A.portrait`) · 훅: `onStart` · `tick` · `customAttack` · `onHit` · `onKill` · `onUnitDeath` · `onLethal` · `onDamaged` · `onCrit` · `steer` · `takenMult` · `atkMult` · `ivOf` · `pickTarget` · `gauge` (**스킬 있는 지후에 gauge 를 달면 SP 막대 대신 그게 보인다**).
- 즉사 `instaKill(src, t, label)` · 피해 `dealDamage` (받는 피해 감소 최대 90% · 최소 1) · 체력 비례 피해는 `pctD(t, v)` 로 (성 5% 한도) · 받는 피해 버프 키 `tk` · SP 는 `skNeed(u)` · `buffSum` 은 스테인리스의 음수 `tk` 를 뒤집지 않는다.
- 투사체 `S.shots` · 관통탄 `S.lines` 는 목록을 비우고 돈다 (`filter` 한 번으로 바꾸지 말 것).
- **`u.ghost` 면 물리가 안 움직인다** (위치를 직접) · 성뿌수기 · 디펜스는 쓰러진 유닛을 2.5초 뒤 `S.units` 에서 치운다 (`cwPurge` · 오래 들고 있는 코드는 깨진다 · 새 소환은 `cwFull` 확인).
- 전장: 가로 (`isEW()` · 릴스만 세로) · 진영마다 세로 3 (`CFG.COLS`) × 가로 5 (`CFG.ROWS`) = 15칸 · `ROW_KIND` [0 전열, 1, 1, 1 중열, 2 후열] · `MAX_UNITS` 15 · 라운드 60초 · 레벨은 경기 안에서만 (최대 Lv5 · 디펜스만 내부 Lv6 · `CFG.LEVEL_ADD` 0.25) · 출격제한 `OVL_LIM`.
- 랭크 (A · A+ · S · SS · SSS · `ENH_MAX` 5 · 이름 `rkN` · **숫자로 보여 주지 않는다**) · 랭크 S 고유능력 `enh6(u)` · SSS 필살기 `ULT` (`u.ult` · `ultStep` · 내 카드 줄 `#ubar` 를 눌러 `ultTap` · 쓸 조건 `ultOk` · 친선전 · 성뿌수기 없음) · 「랭크마다」 수치는 `rkX(u)`.
- 배속: 누구나 1.5배 · VIP 2배 · 디펜스 2배 (`dfSpd`) · 25초 뒤 자동 1.5배 · 루프는 한 프레임에 최대 4스텝 (그 이상 배속은 느린 기기에서 안 나온다).

## 게임 규칙 요약 (수치는 코드가 기준)
- 유저 레벨: Lv.1→2 100 XP · 그 뒤 5% 복리 (`xpNeed`) · 레벨업 보상 `CFG.LEVEL_REWARD` ◆150.
- 모드: 일반전 (봇 · 온라인 대기열) · 친선전 · 아케이드 (미러전 · 랜덤전 · 지후의 탑 · 경쟁전) · 샌드박스 · 이벤트 모드 · **디펜스 (R3.6 새 디펜스 · R3.7 정식)**. 성뿌수기 · 예전 디펜스는 숨김 (코드는 있다).
- 덱 5기 · 등급 일반 / 희귀 / 영웅 / 전설 (+ 한정 `isLim`) · 모집 `CFG.GACHA` · 천장 80 · 픽업 (`puToday` · `puList`) · 중복은 조각 · 랭크업 = 조각 + 골드 (`RK5.SH` · `RK5.G`).
- 토큰제 (`TOK.BASE` · `TOK.UPS` · `tokCost`) · 봇 난이도 1~10 (`BOT_D` · 유저 MMR `mmr()` · `botDPick`) · 봇 덱 `botTierDeck` · 봇 랭크 `botRanks`.
- 화면: 로비는 **ui4** (화이트 · 그레이 · 블랙 미니멀 · 각진 모서리 2~4px · 글꼴 Do Hyeon `u4-dh` · Chakra Petch `u4-cp` · 강조 `#f04a14` · `?ui4=0` 이면 ui3) · 값은 `u3Vals` → `u4Extra` · 템플릿 `ui4Tpl` · CSS 는 `--u4-*` 변수와 `u4-` 클래스 (**새 UI 에 인라인 색 금지**) · `#ui2` 밖 창은 `body.u3-on` 테마를 ui4 로 덮어 쓰고 · 변수가 없으니 색을 CSS 에 직접 + `body.u4-dark` 덮어쓰기. 리더보드는 두 군데 (`#lbTabs` 옛 창 · `u3Vals` 의 `lbTabs` 로비) — 탭을 더하면 둘 다.

## 디펜스 (R3.6~ · `// ═════════ R3.6 새 디펜스`)
- **⚠️ 새 게임처럼** (사용자): 일반전 · 성뿌수기 UI 부품을 가져다 쓰지 않는다 · 전용 바 `#df2Hud` · 전용 창 `#df2Up`.
- 설정 `DF2` · 적 도감 `DF2_FOES` (체력은 `hp × DF2.HPA (× HPK)` · `hpSet` 이 있으면 그 값 그대로) · 보스 `DF2_BOSS` · 구성 `df2Plan` · 한 스텝 `df2Step` (`S.cw.v2`) · 다음 웨이브 `df2Next` (열쇠 `df2KeyGive` · 10웨이브마다 `df2Wipe` · `df2Reborn`).
- 로스터 `c.ros` [{ id, lv (내부 1~6 = 보이는 Lv0~5 · `lvShow`), t, uid, dead }] · 소환 `df2Summon` · 업그레이드 `df2Up` (`df2UpCost` = 소환 비용 × `DF2.UP` · `df2MaxLv`) · 지후를 누르면 `df2UpTap` → 머리 위 `df2UpDraw` · 카드 고르기 `c.sum` (⚠️ `c.pick` 은 예전 정비 시간 = 시간이 멈춘다).
- 준보스 (흑화) 스킬 `DF2.MUB` [3, 20] 두 번만 · 체력 비례 `pctD` ×0.25 (최대 체력 `DF2.BIG_HP` 3001 이상은 ×0.05 · 원자 전자는 `flatD` = 늘 ×0.25 · 비례가 아닌 피해는 `flatD`) · 최면 · 잠금 · 감속은 `DF2.CC` 셋과 준보스에게만 (`ccImm`) · 저주 · 사신의 [즉사] 는 한철에게 0 · 즉사 → 최대 체력 20% · 휴대용 주마등 (`artLast`) 은 디펜스에서 꺼짐 (디펜스는 라이프 1 로 시작).
- **쌓인 효과는 10웨이브마다 초기화** (`df2Wipe` · 예외: 콤보 누적 `comboMult` 는 `df2Next` 에서 웨이브마다) · 웨이브가 바뀌면 쓰러진 지후만 다시 (`df2Reborn`) · 로스터 줄에 남기는 기록 (`ss` · `cbT0` · `wn` · `sm`) 을 더하면 `df2Wipe` 에서 지운다 · 배치 기록 `S.place` 는 비어 있으니 `smRec` 처럼 로스터 줄을 쓴다 · 검 강화 `c.fg` (`df2Forge`) · 개구리 · 솔렘라멘트 합체는 `df2Up`.
- 최고 기록 `profile.dfBeta` (예전 디펜스 `dfBest` · 리더보드 `r2def` 와 따로) · 열쇠 기록 `profile.df2Key` · 도감 `profile.dfSeen` · 측정 방법 `docs/defense-scores.md`.

## 세계관 (서사를 쓸 때)
- 지후들이 사는 **지후왕국**. 국왕 **화염 지후 1호** · 오른팔 **물 지후**. 같은 종류도 1호 · 2호 … 여럿.
- 메인: 황사 지후의 「황사회주의」 지령으로 서쪽 마을 **화염 지후 314호** 반란 → 소탕군 지원자는 암살 · 쉴드 · 검 · 얼음 넷뿐.
- 연결: 왕궁 (근위대장 수호자 · 의원 주사 · 금고 티타늄 · 시계방 시계 · 천문대 별) · 블리자드 ↔ 태양 · 얼음 ↔ 블리자드 (펜팔) · 촉수 ↔ 죠스 · 라이플의 러시안룰렛 트라우마 · 포식이 남의 음식을 먹음 · 조커가 슬롯머신을 털었음.
- 디펜스 세계관: 한철 마을 · 한철 1호 · 친철파 (`DF2_STORY`).
- 지후마다 자세한 연결은 기록 파일의 「세계관 · 서사」와 각 지후 `story` 를 grep.

## 계정 · 서버
- 순위 중복 방지: `r2lb` · `r2def` · `r2tower` · `r2comp` 업로드는 `await lbBlocked()` 를 거친다 (로그인이 풀린 계정 `accLost` · 게스트 uid 바뀜 `profile.guestUid` · 게스트가 남의 등록 닉네임) · 규칙은 `guestNickOk` · 새 순위를 더하면 둘 다 붙인다.
- Firebase `jihoobattle` · 게스트는 익명 인증 · 기록 `r2_backups/<uid>` · 이 기기 `rejhbt.profile.v1`.
- **서버 저장은 한 줄** (R3.8 build 4): `r2_backups` 에 `rev` (이전 + 1) · `sid` (`sessions/<uid>`) · `led {dia, gold, pulls, own}` → 규칙이 낡은 창 · 기기의 저장을 거절 · 접속 때 **자리 먼저** (`claimSession`) → 읽기 (`syncAfterLogin`) · 갈라지면 늘 서버 (`bkStop` · 고르기 창 없음) · 저장은 `backupNow` 하나만 (`ACC.synced` 가 지금 계정일 때) · 서버에 새 칸을 더하면 규칙 `hasOnly` 도 · 다이아 · 골드는 불러올 때 `led` 값.
- **재화 · 지후 추첨은 `er('갈래')`** (계정 · 갈래 · 순번 `profile.rn` 으로 정해진다) — 새 상자 · 보상에 `Math.random` 을 쓰면 기록을 되돌려 다시 뽑을 수 있다 · 갈래는 출처마다 따로.
- **하루 처리는 `newDay(지난 날짜)`** (접속 · 서버 시각 뒤 · 날짜가 앞으로 갈 때만 · `!== todayKey()` 로 쓰지 않는다) · 켤 때 처리는 `dayOpen()`.
- 남이 만든 데이터 (리플레이 · 친선전 · 온라인) 는 `netClean` 을 거친다 · 가입 · 로그인 풀림: `finishSignUp` (닉네임 못 차지하면 계정 삭제) · `pendSign` (끊긴 가입 이어서) · `lostAsk`.
- **비밀번호 찾기** (R3.8 build 6): 로그인 화면 `pwForgot` → 연결해 둔 Google 로 들어와 새로 정함 · 연결이 없으면 운영자가 `node tools/pw-reset.js <UID|닉네임>` (임시 비밀번호 · 본인 확인 먼저 · 서비스 계정 키 필요 · **내가 실행하지 않는다**) · 가짜 이메일이라 재설정 메일은 없다.
- 감시: `node tools/audit.js` (읽기 전용 · `--hist` `--backup` `--replays` · 기준 `문서/jhbt-app/audit.json` · **기준 · 결과를 저장소에 넣지 않는다**) · 규칙 시험 `node tools/rules-test.js` (서비스 계정 키 필요).
- **`normProfile` 이 보는 데이터 (`ITEMS` · `FRAMES` · `MQ` · `RK5` …) 는 `let profile = loadProfile()` 보다 앞에** (뒤면 TDZ 로 안 켜진다).
- 프로필을 한 번 옮기는 변환은 플래그로 (`p.rk5` · `profile.artC` …). 프로필에 없는 필드를 쓰지 않는다 (예: `profile.games` 는 없다 → `wins + losses`).
- 매일 보상 · 날짜는 **`todayKey()` · `stDay()`** (한국 · 서버 시간) · `new Date()` 로 날짜를 만들지 않는다 (시간대를 바꿔 무료 모집을 무한으로 돈 유저가 있었다).
- 보상 · 소비 함수 맨 앞에 `alWhy('이유')` (활동 기록).
- 운영: `admins/<uid>` · 정지 `bans/<uid>` · 점검 `config/maintenance` · 로비 공지 `config/announce` · 띠 `config/bcast` · 운영 우편 `giftMail` (`giftOk`) · 개발자 도구 `#opModal` (`opOpen(탭)` · 새 운영 기능은 탭으로) · 욕설 `hasBad` (금지어를 늘리면 rules 의 `cleanName` 도).
- 소식 `events` (type 은 rules 의 목록에 있어야 한다 · `ban` 은 운영자만 · 모양과 문구는 `newsItem` · 새 종류는 rules · `newsItem` · CSS `.nwk-*` 를 같이 · 닉네임 없는 손님은 `guestPost`) · 접속 중 `pres/<uid>` · 동접 `pulse` · 리더보드 `r2lb` (필드는 rules `hasOnly` 에 있어야 한다 · 규칙 게시 전이면 `FB.noXx` 로 빼고 다시 올리는 패턴).
- 서버에 쓰는 기능은 실서버로 시험하지 않는다 → 코드 · 규칙만 맞추고 「실서버 미확인 · 규칙 게시 필요」를 알린다.
- `dlg` 가 다른 dlg 에 밀리면 `null` — 꼭 골라야 하는 창은 null 이면 다시 묻는다.

## 안드로이드 앱 (APK)
- **Capacitor 7** · `app/` (패키지 `kr.jihoobattle.app` · 바꿀 수 없음) · 게임 파일을 APK 안에 → 업데이트마다 새 APK.
- 만들기: `cd app` → `npm run sync` (`tools/app-sync.js`) → `cd android` → `JAVA_HOME=<JDK 21> ./gradlew.bat assembleRelease` → `app/android/app/build/outputs/apk/release/app-release.apk`.
- **새 APK 마다 `app/android/app/build.gradle` 의 `versionCode` +1 · `versionName` = 게임 버전.**
- 도구 (저장소 밖): JDK 21 `C:/Users/User/AppData/Local/jhbt-android/jdk` · SDK 35 `…/jhbt-android/sdk`.
- **서명 키** `C:/Users/User/Documents/jhbt-app/jhbt-release.jks` + `keystore.properties` (git 에 안 올림 · **잃어버리면 업데이트를 못 낸다**).
- 게임 안 `IS_APP`: 서비스 워커 없음 · 새 버전 확인은 `APP_SITE` 와 비교 · 구글 로그인 막음.
- 로컬 파일 (아이콘 · 효과음 · 유물 그림 …) 을 더하면 `python tools/sw_assets.py` 로 오프라인 CORE 를 다시 만들고 `sw.js` 의 `CACHE` 끝 숫자를 올린다.

## 코드 리뷰 · 리팩터링 (`tools/review/` README)
- **동작을 바꾸지 않는 정리만**: 고치기 전 고정 시드 전투 120판 (`tools/tierlist/run.js`) 저장 → 정리 → 같은 결과 (`cmp`) + 첫 로딩 · 벤치 · `comment-check.py`.
- `survey.py` (안 쓰는 함수 · CSS) · `css-prune.py [--dry]` · `toc.py` (맨 위 목차 · 큰 구간에는 `// ═════════ 제목` 머리말).
- 이름을 조립해 쓰는 CSS (`r-<등급>` · `tier-<티어>` · `g1` 등) 는 안 쓰는 것처럼 보여도 지우지 않는다.

## ⚠️ 작업하다 겪은 함정 (꼭 읽기)
- **`index.html` 은 줄바꿈이 섞여 있다 (CRLF · LF).** 파이썬은 `open(P, encoding='utf-8', newline='')` 로 읽고 쓴다 (안 그러면 diff 2만 줄). **Edit 도구도 줄바꿈을 한쪽으로 바꾼다** → `index.html` 은 파이썬 치환으로만.
- **치환 스크립트 패턴**: `r(old, new, cnt=1)` 목록 → `s.count(old) == cnt` 를 모두 확인한 뒤에만 쓴다 (하나라도 틀리면 아무것도 안 쓰고 멈춤) · 여러 줄 old 는 `\r\n` 으로 한 번 더 · 치환은 순서대로라 **같은 줄을 바꾸는 치환은 하나로 합친다**.
- **찾는 문자열이 주석 · 도감 · 패치노트에도 있으면 개수가 2 이상** (예: 「최대 체력 80%」가 코드 주석과 `CHAR_INFO` 에 둘) → 미리 `grep -n` 으로 어디 있는지 보고 cnt 를 맞춘다.
- **새 전역 이름은 먼저 grep** (`const DD_RED` 를 만들었다가 이미 있는 색 상수와 겹쳐 스크립트 전체가 죽었다 · `node --check` 가 잡는다).
- **해시 · 비트 연산 결과로 배열을 고를 때 `>>> 0`** (`^` · `|` 는 음수를 만든다 → `L[-n]` = undefined → 기본값으로 빠진다 · 오늘의 픽업이 날에 따라 화염 지후로 나온 버그).
- **bash heredoc 함정**: 따옴표 · `\n` · 백틱이 많은 긴 파이썬은 깨진다 → **긴 스크립트는 Write 로 scratchpad 에 `.py` 로 쓰고 실행** · JS / CSS 덩어리도 따로 파일로 쓰고 스크립트가 읽어 넣는다.
- **`sleep` 을 앞에 붙인 명령은 막힌다** → `run_in_background` 나 조건 반복.
- 스크립트 문법 검사는 큰 `<script>` 를 정규식으로 뽑아 scratchpad 에 쓰고 `node --check` (여러 스크립트가 있다 · 가장 큰 것이 게임).
- `CHARS` 의 한 지후 정의는 여러 줄 → `awk` 로 다음 `^  id: { name:` 줄 전까지 본다 · 지후 id 는 이름과 다르다 (회오리 `whirl` · 부루스타 `burner` · 냉각 `frostj` · 마탄 `magic` · 더블딜러 `dealer` · 낚시 `fisher`) → `grep "name: '회오리 지후'"` 로 찾는다.
- 숫자 하나를 바꿀 때 같은 값이 쓰인 곳 (설명 · 도감 · 랭크 S 설명 · 표시 카드 · 다른 상수가 그 값을 비율로 쓰는 곳) 을 같이 찾는다 (예: `MX.T` 는 필살기 회복 비율에도 쓰인다).
- 커밋에 시험용 PNG · 임시 JSON 이 섞이지 않게 `git status` 확인.

## 토큰 아끼기 (작업 방식)
- **작업 하나 = 세션 하나.** 주제가 바뀌면 새 세션 · 남은 일은 `docs/next.md` 에 적고 다음 세션은 그것부터 읽는다.
- **`index.html` 을 통째로 읽지 않는다** (10MB): `grep -n "^function 이름\|^const 이름"` → 필요한 줄만 `sed -n 'a,bp' | cut -c1-600` · 긴 한 줄은 `grep -o ".\{0,80\}찾는말.\{0,120\}"` · **초상화 base64 줄 (`PORTRAITS` · 8000~8420 줄 근처 · `data:image`) 은 빼거나 `cut -c`** · 여러 곳은 한 번에 · 개수만이면 `grep -c` / `s.count`.
- 스크린샷은 꼭 필요할 때만 (한 장에 1,000~2,000 토큰).
- 요청이 여러 갈래면 패치 스크립트도 갈래별로 (실패 범위를 줄인다) · 체크리스트는 단계마다 바로 체크.
- UI 리디자인: 작은 것은 레퍼런스 → 코드 → 스크린샷 · 큰 것만 디자인 캔버스 (1280×720 · 한 장만).

## 작업별 가이드 (루틴 · 팁)

### 1. 신규 지후 만들기
**루틴**
1. 사용자가 준 것 (이름 · 등급 · 수치 · 능력 · 초상화) 과 안 준 것을 나눈다 → 안 준 것 (역할군 · 사거리 · 이동속도 · 토큰 · 디펜스 토큰 · 랭크 S · 필살기) 은 **비슷한 지후를 grep 해서 맞춰 정하고** 대답에 적는다.
2. 초상화: 흰 배경 256 PNG → base64 를 `PORTRAITS` 에 (파이썬으로 · 줄이 길다) → `sig-color.py` 로 `SIG_C` → 확인표를 눈으로 본다. 변신 · 스킬 그림이 따로 있으면 `portraitSkill` 등 · `A.portrait(u, src)` 로 바꾼다.
3. `CHARS` 끝에 정의 (비슷한 지후 하나를 통째로 읽고 모양을 따른다) · 도우미 함수는 `reapFx` 앞 도우미 칸 · 상수는 `const XX = { … }` 한 줄로 모아 둔다 (밸런스 때 한 곳만 고치게).
4. `passive` · `skill.desc` (쉽게 · 한두 문장) · `CHAR_INFO[id]` (자세한 숫자) · `story` · 랭크 S `enh6` 설명 · 필살기 `ULT` 가 있으면 그 칸.
5. 체크리스트 (위 「신규 지후 체크리스트」) 의 표들: `STATUS` · `FX_OF` · `BUFF_SRC` · `FIRE_T` · `ICE_T` · `COLS` · `ADJ_BUFF` · 배치 기록 필드 (`packPlace` · `canFuse`) · 변신 지후 숨김 · `TOK_COST` / `tok` · `DF2_TOK`.
6. 검사: 주석 · 문법 → 헤드리스 전투 (새 지후를 반드시 넣은 판 수십 판 · Lv1 · Lv5 · 랭크 S · SSS) → 디펜스 1판 (디펜스에서 깨지는 지후가 많다) → `?bench=50&ids=<새 지후>` 프레임 → 이펙트는 스크린샷 1장.
7. 패치노트 tag `new` → 신규 지후 인포그래픽 (`notes2json --new` · `make.py` `NAMES` · `infographics/portraits.json`).

**팁**
- 능력은 기존 훅 (`onHit` · `tick` · `onUnitDeath` …) 으로 거의 다 된다 → 비슷한 능력의 지후를 먼저 찾아 그 방식을 따른다 (새 엔진 코드는 마지막 수단).
- 스킬 타이밍 · 지속은 `A.later` (전투 시간) · 남은 시간은 `S.time` 기준 (`u.xxT = S.time + 5` 처럼) · `setTimeout` 은 연출에만.
- 판정 · 대상 고르기 무작위는 `rng()` · 연출만 `Math.random`.
- 머리 위 숫자 · 게이지는 `gauge(u)` 또는 캔버스 머리 위 글씨 · DOM 을 붙이면 50기에서 느려진다.
- 쓰러짐 · 부활 · 변신이 있으면 성뿌수기 · 디펜스의 `cwPurge` (2.5초 뒤 치움) · `df2Reborn` (웨이브마다 새로 태어남) 에서 깨지지 않는지 본다.
- 즉사 · 체력 비례는 `instaKill` · `pctD` 로만 (성 · 디펜스 · 보스 규칙이 거기 들어 있다).
- 정한 것 (토큰 · 역할군 · 랭크 S …) 은 「정한 것」 목록으로 따로 알린다 — 사용자가 고쳐 달라고 하기 쉽다.

### 2. 밸런스 패치
**루틴**
1. 지후 이름 → id 찾기 (`grep "name: '회오리 지후'"` · id 가 이름과 다르다).
2. 지후마다 `CHARS` 정의 (여러 줄) + 그 지후 도우미 함수 + 상수 객체 (`FK` · `VC` · `DK` · `MX` …) + `CHAR_INFO` 줄 + 랭크 S `enh6` 설명 + `TOK_COST` / `DF2_TOK` 을 모아 본다.
3. 바꿀 값마다 **코드 · 설명 (`passive` · `skill.desc`) · 도감 (`CHAR_INFO`) · 랭크 S 설명 · 팁** 을 한 번에 고치는 치환 목록을 만든다 (주석 `/* R3.x: 이전 → 이후 */` 를 남긴다).
4. 패치 스크립트 하나로 적용 (cnt 확인) → 주석 · 문법 → 바뀐 지후를 넣은 헤드리스 전투 100판 이상.
5. 패치노트: **변경 하나 = 항목 하나** (체력 · 공격력을 한 줄에 몰지 않는다 · 타일이 하나씩 나온다) · 방향은 플레이어 기준 (적 체력 증가는 adjust) · 숫자는 `<b>이전 → 이후</b>`.
6. 인포그래픽 밸런스 타일 확인 (넘치는 문구는 짧게).

**팁**
- 「토큰 수는 일반전 기준」 · 디펜스 토큰은 `DF2_TOK` 로 따로.
- 토큰은 `CHARS[id].tok` 가 `TOK_COST` 보다 먼저 → 둘 중 어디 있는지 보고 고친다.
- 같은 숫자가 다른 계산에도 쓰이는지 본다 (`MX.T` 가 필살기 회복 비율에도 · 변신 지후 (`phoenix2`) 는 따로 정의라 원래 지후를 고쳐도 안 바뀐다).
- 「~% 상승」 은 +x% (×(1+x)) 로 읽고 · 애매하면 정해서 알린다 (예: 「200% 상승」 → ×3).
- 이미 그렇게 동작하는 요청 (예: 농부 밭 공유) 은 고치지 말고 「이미 그렇다」고 알리고 패치노트에도 넣지 않는다.
- 리워크와 수치 조정이 섞이면 리워크는 나눈 세션 · 수치는 메인 (「큰 작업 나누기」) · 같은 `CHARS` 줄을 둘 다 고치면 충돌한다.
- 메커니즘을 바꾼 뒤의 티어표는 다시 재야 맞다 (예전 `TIER_SC` 는 참고만).

### 3. 버그 고치기
**루틴**
1. **먼저 재현** — 증상의 화면 글자 · 이름으로 grep → 그 값을 만드는 함수를 거꾸로 따라간다 (예: 「오늘의 픽업」 템플릿 → `u4.pu` → `puToday`).
2. 원인을 한 줄로 말할 수 있을 때까지 읽는다 (추측으로 고치지 않는다) · 헤드리스에서 함수 값을 직접 찍어 본다 (`__rejhbt` 에 시험 함수를 더해서).
3. 고친다 · 같은 패턴이 다른 곳에도 있는지 grep (예: 다른 해시 · 다른 `S.lives === 1` 판정).
4. 재현 방법으로 고쳐졌는지 확인 → 다른 모드 (일반전 · 디펜스 · 친선전 · 리플레이) 에 영향이 없는지 → 주석 · 문법 · 헤드리스 전투.
5. 패치노트 tag `fix` · 「버그 수정」 칸 (증상만 짧게).

**자주 나온 원인**
- 모드마다 다른 규칙 (디펜스는 라이프 1 로 시작 → 「목숨 1개」 조건이 늘 참 · 디펜스 지후는 웨이브마다 다시 태어남 · 성뿌수기는 쓰러진 유닛을 치움).
- 비트 연산 음수 (`>>> 0`) · `undefined` 로 빠져 기본값 (화염 지후 · `fire`) 이 나오면 대개 고르기 실패.
- 줄 중간 `//` 로 코드가 사라짐 (오류 없이 기능만 없어짐) → `comment-check.py`.
- 변신 · 초상화가 다른 타이머에 덮임 (듀얼리스트: 베기 그림이 스킬 그림을 0.8초 뒤 되돌림) → 상태 시각 (`u.xxT`) 을 두고 우선순위를 정한다.
- 배속 · 느린 기기: 루프가 한 프레임에 최대 4스텝 → 높은 배속은 실제로 안 나온다.
- 서버 기능이 「안 된다」 → 대부분 규칙 게시 전 (`permission-denied` · `FB.noXx`).
- 프로필 필드가 없는데 쓴 것 (`profile.games` 없음) · TDZ (`normProfile` 데이터 순서).

### 4. 게임 UI 고치기
- **어느 UI 인지 먼저**: 로비 ui4 (`ui4Tpl` 템플릿 + `u3Vals` → `u4Extra` 값 · `<sc-if>` · `<sc-for>` · `{{ }}`) · 예전 ui3 (`?ui4=0`) · `#ui2` 밖 창 (설정 · 업데이트 안내 · 계정 · 결과 · 리더보드 옛 창 `#lbTabs`) · 전투 화면 (`#screen-battle` · h4 · `#ubar` · 디펜스 `#df2Hud`). 같은 기능이 두 군데 있는 일이 많다 (리더보드 탭 · 픽업 카드) → 둘 다 고친다.
- **디자인 (ui4)**: 화이트 · 그레이 · 블랙 미니멀 · **각진 모서리 2~4px** (사용자가 좋아함) · 굵은 검정 테두리 · 강조 주황 `#f04a14` · 글꼴 Do Hyeon (한글 제목 `u4-dh`) · Chakra Petch (영문 · 숫자 `u4-cp`) · 작은 영문 머리말 (`UPDATE` · `SQUAD` 같은 letter-spacing) · 반투명 블러 · 큰 그림자 · 둥근 알약 모양은 옛 디자인.
- CSS 는 `--u4-*` 변수와 `u4-` 클래스 · **인라인 색 금지** · `#ui2` 밖은 변수가 없으니 색을 CSS 에 직접 쓰고 다크 (`body.u4-dark`) 를 같이 · 예전 규칙을 덮을 때는 id 선택자로 (`#updateOverlay .update-card …`).
- 로비 갱신은 `u2Render()` (1초마다도 돈다 · 무거운 계산을 넣지 않는다) · iPad 스크롤은 `UI2.busy` 로 터치 중 쉰다.
- **전투 화면 위 DOM**: 3D 전장 바닥에 가려질 수 있다 → 머리 위에 · `#screen-battle` 안에 넣어 전투가 끝나면 같이 숨게 · 위치는 프레임마다 `translate` 만 · 반투명 opacity 금지 (폰 깜빡임) · 클릭은 `elementFromPoint` 로 확인.
- 글은 짧게 (규칙 9) · 버튼 · 탭 이름 1~4글자 · 영문 보조 라벨은 기존 표 (`EN = { cp: 'CP' … }`) 에 더한다.
- 모바일 · 좁은 화면: 세로 스크롤 칸은 `.u2-scroll` (자식 `flex-shrink:0`) · 탭이 늘면 가로로 넘치는지 확인.
- 확인: 스크린샷 1장 (1280×720) · 다크 · 모바일은 바뀐 곳에 영향이 있을 때만 · 큰 리디자인만 디자인 캔버스.

## 미뤄 둔 일
- 길드는 아직 만들지 않았다 (만들 때: 생성 ●20,000 · 탈퇴 뒤 24시간 재가입 · 최대 5명 · 길드마스터 / 부길드마스터 · 폭파 · 길드 랭킹은 길드원 전투력 합). 전투력 · 리더보드 cp 는 `docs/CLAUDE-history.md` 「R2.21」.
- 「build 는 배포 때만 올리기 · 맘에 안 드는 것은 `docs/next.md` 에 쌓기」 규칙은 사용자가 보류 중.
- 딸깍 패치기 모바일 (보류 · 2026-11-26): 같은 와이파이 (0.0.0.0 + 주소 토큰 비밀번호) 또는 Tailscale · 좁은 화면 한 줄 레이아웃 · PC 가 켜져 있어야 한다.
- 새 디펜스 최고 기록을 리더보드 (`r2def`) 에 올릴지 (지금은 예전 디펜스 기록만 · 정식 전환 때 따로 둠).

## 최근 변경 (R3.7 · 2026-11-26 · build 1~8)
- build 8: 소식 개편 (`// ═════════ R3.7 build 8 소식` · ui4 소식 창 `.u4-nw` 갈래 탭 + HEADLINE 카드 · 로비 줄 `newsTicker` · ui3 는 글만) · 새 소식 visit · gone · welcome · quit · first · vs · streak (5·10·15·20) · broke · tower (15층) · promo · almost (이기면 승급하는 판에서 짐) · friend · ban · 전설만 전용 문구 · 모집 소식은 전설이 없는 판에 하나 (영웅 또는 처음 얻은 지후) · 닫을 때 보내는 소식은 안 올라갈 수 있다 · **규칙 게시 필요** · 실서버 미확인.
- build 7: 순위 중복 방지 (위 「계정 · 서버」) · 로그인이 풀린 상태 (`accLost`) 의 새 계정 만들기 막음 · 리더보드 `r2lb` 의 level · xp 는 서버에서 새 공식으로 한 번 환산했다.
- build 6: ui4 랭킹 개편 (`u4Lb` · `LB4_LABEL` · CSS `.u4-lb-*` · 지휘관 명단 + 선수 카드 `UI2.st.lbSel` · ui3 랭킹은 그대로) · 겹치는 짧은 클래스 이름 (`.av` 등) 은 전역 규칙에 걸리니 `lb*` 처럼 전용 이름 · `pfHtml` 옵션 `still` (멈춤 · 장식은 그림 `pfOrnImg`) · `blob` (가벼운 사진) · `u4Recolor` 는 `<!--pf-->` 구간 (프로필 테두리) 의 색을 바꾸지 않는다.
- build 5: 유저 레벨 필요 경험치 복리 15 → 5% (`xpNeed`) · 옛 기록은 `lvMove` 가 한 번 환산 (`profile.xp5` · `normProfile` 과 서버 기록 `bkParse` · 오른 레벨의 보상 없음) · 레벨업 보상 ◆150.
- build 4: 프로필 테두리 — 레벨 `PF_LV` (금 · 5·10·15·20·30·40·50) · 경쟁전 `PF_CP` (브론즈~챌린저 · 번개는 R1 개발자 테두리 방식 · kind `cp` · `profile.comp.speak` 이번 시즌 최고 · 그 시즌 동안만 `cpFrameSweep` · `comp.fs`) · 디펜스 `PF_DF` (금속 · 10~100웨이브 클리어 = `dfBeta - 1` · kind `dfc`) · 도전 7종 (먹 · 월하 · 서리꽃 = 출석 14 · 50 · 100 · 아르데코 · 왕국 문장 = 100 · 500승 · 회로 탑 20 · 프리즘 지후 50).
- 테두리 그리는 법: 장식 SVG `orn` (100 × 100 · `class="d"` 는 48px 미만에서 숨김) · 움직임은 opacity · transform 만 (`pf-stA/B` 번개 · `pf-crk` 전류 · `pf-glow` · `pf-tw` · `shine` · `shake`) · 잠긴 · 48px 미만은 멈춤 · 전투 HUD 도 원본처럼 둥글게 (`.r3pf .av.pfw` 덮어쓰기 · 장식 표시 · 움직임 없음 · 기본 테두리는 진영 색 · 덱 칸도 둥글게 26% — 화면의 네모 모서리는 사용자가 각졌다고 함) · 업적 종류 표 `FRAME_K` · 글 `frameTxt` · `frameProg` · id 는 rules 정규식 `^[a-z0-9]{1,8}$` 안에서.
- 리워크 4종 (세션을 나눠 각자 브랜치 → 합침): 사신 (`rpr*` · 봉인 · [망령] 6개 → 강림 · 낫은 캔버스 `rprDraw`) · 냉각 ([극지방] `S.pz` · 8초 감속 → 2.5초 빙결) · 마탄 ([스코프] · 필살기는 마탄 5발 `ultOk`) · 변이 (배치 기록 `p.mu` · 판정 없는 자리는 `mutKey` 로 rng 한 번).
- 수치 조정 16종 · 토큰 태양 8 · 불사조 6 · EMP 3 · 변이 2 (디펜스 8) · 더블딜러 빨간 카드 배율 `DD_RK` · 농부 밭 최대 8.
- build 3: 원자 전자는 큰 한철의 95% 감소만 받지 않는다 (디펜스 12.5 → 3.1%) · 콤보 누적은 디펜스에서 웨이브마다 초기화.
- build 2: 디펜스 밸런스 (위 「디펜스」) · 샌즈 내 쪽 밀치기 · 가판대 전향 삭제 · 가판대 토큰 지급 삭제 (모든 모드) · 디펜스 토큰 총? 670 · 슬롯 777 · 핵 50.
- 디펜스 정식 (위 「디펜스」) · 업그레이드 창 · 열쇠 · 10웨이브 정리 · 준보스 · 4배속 삭제.
- 소식 `login` 의 b = `new` · `m<분>` · 떠남 `leave` (`presLeave` · pagehide · 로그아웃) · 리더보드 접속 시간 `pt` (`profile.playM`) — **규칙 게시 필요** (events leave · r2lb pt) · 업데이트 안내 창 ui4 · `puToday` 음수 버그 · 듀얼리스트 스킬 초상화 (`u.dlSkT`).

## 최근 변경 (R3.8 · 2026-11-27 · build 1~5)
- build 5: 접속 차단 `#blockOverlay` (정지 · 점검 포함) · JHBT 계정 `#accModal` 은 심플 디자인 (`.a2` · 색 `--a-*` · 사용자 취향: 계정 · 설정류는 **심플하고 세련되게**, 포스터풍 아님).
- build 4: 보안 강화 (규칙 + PC 감시 · 사용자가 심판 서버는 안 함) — 저장 순번 · 계정 중복 차단 · 시드 추첨 · 날짜 · 리플레이 정화 (위 「계정 · 서버」) · **규칙 게시 필요** · 실서버 미확인 · 2단계 (옛 저장 방식 차단 · 재화 상한) 는 `docs/next.md`.
- build 3: 업적은 퀘스트 창 탭이 아니라 **바로가기 세 번째 칸** (`rail` · `qs: 'ach'` 면 제목 「업적」 · 탭 없음).
- build 3 (사용자 승인 시안 「낙서 포스터」: 지후 그림 스티커 · 검정/주황 사선 · Black Han Sans 큰 글씨): 이벤트 `#evHub` 는 허브 `evhHub` → 상세 (`EVH.tab` · `data-tab` · ✕ = 허브 → 닫기 · 색은 `--e-*` · 1280×720 배율 `evhFit`) · 친구는 `s4Skin` (ui4 전용 마크업 `.s4-` · 가운데 `s4Spot` = 랭킹 기록의 cp · deck) · 업적은 `u4Ach` + `.u4-ac*`. **UI 를 새로 꾸밀 때는 조금 다듬기가 아니라 구성부터 바꾼 시안을 먼저 보여 준다** (색 · 테두리만 바꾼 것은 「바뀐 게 없다」였다).
- 헤드리스에서 게임 전역은 안 보인다 → 임시 사본의 `window.__rejhbt = {` 에 `ev0: c => eval(c),` 를 넣어 시험 (끝나면 지움).
- build 2: ui4 로비 모드 탭 (`.u4-modes`) 을 없애고 오른쪽 **게임 모드** 버튼 + 고르기 화면 (`u4Extra` 의 `gmList` · 상태 `UI2.st.u4md` · CSS `.u4-gm*`) · 새 모드는 `gmList` 에 한 줄 · 오늘의 픽업 칸 절반 · 바로가기 빨간 점은 칸마다 (`rail`) · 초보자 모집 희귀 10 · 일반 82.
- 전설 획득 소식 `NEWS_LINE`: 어미를 「{n} 님에게서 ○○이/가 느껴집니다.」 · 「{n} 님이 ○○ 힘을 얻었습니다.」 둘로 통일 (러시안룰렛만 예외) · 새 전설도 이 두 형식으로.
