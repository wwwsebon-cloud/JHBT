# 디스코드 알림 (Cloudflare Worker)

게임에서 일어난 일을 디스코드 채널에 올립니다.

- 🎉 **가입**: 새 플레이어가 계정을 만들었을 때
- 🌟 **전설 획득**: 전설 지후를 뽑았을 때 (뽑기 · 상자 · 모집권)
- 🏆 **게임 결과**: 랭크전 · 경쟁전 · 드래프트전이 끝났을 때. 승패 · 라운드 점수 · 내 덱 · 상대 이름과 덱 · MVP · 상대 MVP · 경험치/TP 변화

웹후크 주소는 게임(`index.html`)에 넣지 않습니다. 게임 파일은 누구나 볼 수 있어서, 주소가 보이면 누구든 채널을 도배하거나 웹후크를 지울 수 있기 때문입니다.
대신 게임은 이 Worker로 보내고, Worker가 **로그인 토큰을 검사한 뒤** 정해진 모양의 메시지만 디스코드로 넘깁니다. 한 플레이어가 너무 자주 보내면 거절합니다.

## 1. 디스코드 웹후크 만들기

디스코드 서버 설정 → **연동** → **웹후크** → **새 웹후크** → 이름·채널 고르기 → **웹후크 URL 복사**.

## 2. Worker 만들기 (웹 화면에서, 설치 없이)

1. https://dash.cloudflare.com 가입 · 로그인 (무료 요금제로 충분합니다).
2. 왼쪽 **Workers & Pages** → **Create** → **Create Worker** (Hello World) → 이름을 `jhbt-discord` 로 → **Deploy**.
3. **Edit code** → 원래 코드를 모두 지우고 이 폴더의 `worker.js` 내용을 붙여넣기 → **Deploy**.
4. Worker의 **Settings → Variables and Secrets** 에서 세 개를 추가합니다.

   | 이름 | 종류 | 값 |
   |---|---|---|
   | `DISCORD_WEBHOOK_URL` | **Secret** | 1번에서 복사한 웹후크 URL |
   | `FIREBASE_PROJECT_ID` | Text | `jihoobattle` |
   | `ALLOWED_ORIGINS` | Text | `https://wwwsebon-cloud.github.io` |

5. Worker 주소를 복사합니다 (예: `https://jhbt-discord.아이디.workers.dev`).

## 3. 게임에 연결

`index.html` 의 `const DISCORD_RELAY_URL = '';` 에 Worker 주소를 넣고 배포합니다.
비워 두면 게임은 아무것도 보내지 않습니다. 개발자 모드에서도 보내지 않습니다.

### 명령줄로 하고 싶으면

```bash
npm i -g wrangler
wrangler login
wrangler secret put DISCORD_WEBHOOK_URL   # 웹후크 URL 붙여넣기
wrangler deploy                           # wrangler.toml 의 변수가 같이 올라갑니다
```

## 메모

- 로그인하지 않은(오프라인) 플레이어의 기록은 올라가지 않습니다.
- 도배 제한: 같은 플레이어 기준 가입 10분 · 전설 3초 · 게임 결과 15초에 한 번.
- 웹후크 주소가 새어 나갔다면 디스코드에서 그 웹후크를 지우고 새로 만든 뒤 `DISCORD_WEBHOOK_URL` 만 바꾸면 됩니다.
