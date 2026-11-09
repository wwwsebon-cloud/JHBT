// RE : 지후배틀 서비스 워커 — 앱 설치(PWA)와 오프라인 플레이 (R2.24 build 4: 오프라인 모드).
// 항상 네트워크를 먼저 쓰고, 연결이 없을 때만 받아 둔 사본을 보여준다 (새 버전 배포가 늦게 보이는 일이 없다).
// 설치할 때 게임에 꼭 필요한 파일(CORE · 약 2.5MB)을 미리 받아 두고, 배경음악 · 큰 이모티콘 · 글꼴처럼 큰 것은 한 번 쓸 때 받아 둔다 (RT).
// 버전 확인 요청(?vc=)과 Firebase 는 건드리지 않는다. 파일을 더하면 python tools/sw_assets.py 로 CORE 목록을 다시 만든다.
const CACHE = 'rejhbt-r2-core-5'; // 미리 받는 사본 (목록이 바뀌면 이름을 바꾼다 · 예전 사본은 지운다)
const RT = 'rejhbt-r2-rt'; // 쓸 때 받아 두는 사본 (버전이 바뀌어도 남긴다)
const SHELL = ['./', 'manifest.webmanifest'];
// ── CORE (tools/sw_assets.py 가 만든다 · 손으로 고치지 않는다) ──
const CORE = [
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/fx/alone.png',
  'icons/fx/antigrav.png',
  'icons/fx/arcana.png',
  'icons/fx/aspdDown.png',
  'icons/fx/aspdUp.png',
  'icons/fx/atkDown.png',
  'icons/fx/atkUp.png',
  'icons/fx/ban.png',
  'icons/fx/blind.png',
  'icons/fx/bubble.png',
  'icons/fx/burn.png',
  'icons/fx/c4.png',
  'icons/fx/card.png',
  'icons/fx/charm.png',
  'icons/fx/critDmgUp.png',
  'icons/fx/critUp.png',
  'icons/fx/dive.png',
  'icons/fx/dnote.png',
  'icons/fx/dodgeUp.png',
  'icons/fx/drowsy.png',
  'icons/fx/feast.png',
  'icons/fx/freeze.png',
  'icons/fx/frost.png',
  'icons/fx/guard.png',
  'icons/fx/healDown.png',
  'icons/fx/inv.png',
  'icons/fx/lacer.png',
  'icons/fx/lastBullet.png',
  'icons/fx/lock.png',
  'icons/fx/miscDown.png',
  'icons/fx/miscUp.png',
  'icons/fx/nbdead.png',
  'icons/fx/nbfly.png',
  'icons/fx/noheal.png',
  'icons/fx/nou.png',
  'icons/fx/poison.png',
  'icons/fx/pure.png',
  'icons/fx/rage.png',
  'icons/fx/reaper.png',
  'icons/fx/regen.png',
  'icons/fx/seal.png',
  'icons/fx/silence.png',
  'icons/fx/sleep.png',
  'icons/fx/spdDown.png',
  'icons/fx/spdUp.png',
  'icons/fx/stealth.png',
  'icons/fx/stun.png',
  'icons/fx/takenDown.png',
  'icons/fx/takenUp.png',
  'icons/fx/wound.png',
  'sfx/attack.mp3',
  'comic/1.png',
  'comic/10.png',
  'comic/11.png',
  'comic/12.png',
  'comic/13.png',
  'comic/14.png',
  'comic/15.png',
  'comic/16.png',
  'comic/17.png',
  'comic/18.png',
  'comic/19.png',
  'comic/2.png',
  'comic/20.png',
  'comic/3.png',
  'comic/4.png',
  'comic/5.png',
  'comic/6.png',
  'comic/7.png',
  'comic/8.png',
  'comic/9.png',
  'emo/thumb/art_01.png',
  'emo/thumb/art_02.png',
  'emo/thumb/art_03.png',
  'emo/thumb/art_04.png',
  'emo/thumb/art_05.png',
  'emo/thumb/art_06.png',
  'emo/thumb/art_07.png',
  'emo/thumb/art_08.png',
  'emo/thumb/art_09.png',
  'emo/thumb/art_10.png',
  'emo/thumb/art_11.png',
  'emo/thumb/art_12.png',
  'emo/thumb/art_13.png',
  'emo/thumb/art_14.png',
  'emo/thumb/art_15.png',
  'emo/thumb/art_16.png',
  'emo/thumb/art_17.png',
  'emo/thumb/art_18.png',
  'emo/thumb/art_19.png',
  'emo/thumb/art_20.png',
  'emo/thumb/art_21.png',
  'emo/thumb/art_22.png',
  'emo/thumb/art_23.png',
  'emo/thumb/art_24.png',
  'emo/thumb/art_25.png',
  'emo/thumb/art_26.png',
  'emo/thumb/art_27.png',
  'emo/thumb/art_28.png',
  'emo/thumb/art_29.png',
  'emo/thumb/art_30.png',
  'emo/thumb/art_31.png',
  'emo/thumb/art_32.png',
  'emo/thumb/art_33.png',
  'emo/thumb/art_34.png',
  'emo/thumb/art_35.png',
  'emo/thumb/art_36.png',
  'emo/thumb/art_37.png',
  'emo/thumb/art_38.png',
  'emo/thumb/art_39.png',
  'emo/thumb/art_40.png',
  'emo/thumb/art_41.png',
  'emo/thumb/art_42.png',
  'emo/thumb/gif_01.png',
  'emo/thumb/gif_02.png',
  'emo/thumb/gif_03.png',
  'emo/thumb/gif_04.png',
  'emo/thumb/gif_05.png',
  'emo/thumb/gif_06.png',
  'emo/thumb/gif_07.png',
  'emo/thumb/gif_08.png',
  'emo/thumb/gif_09.png',
  'emo/thumb/gif_10.png',
  'emo/thumb/gif_11.png',
  'emo/thumb/gif_12.png',
  'emo/thumb/gif_13.png',
  'fonts/SongMyung-Regular.woff2',
];
// ── CORE 끝 ──
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net']; // 글꼴 CSS · 파일 (바뀌지 않는 주소라 받아 둔 사본을 먼저)

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL).catch(() => {})
    .then(() => Promise.all(CORE.map(p => cache.add(p).catch(() => {}))))) // 하나가 없어도 나머지는 받는다
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE && key !== RT).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

const put = (name, key, res) => caches.open(name).then(c => c.put(key, res)).catch(() => {});
const hit = key => caches.match(key, { ignoreVary: true });

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (!FONT_HOSTS.includes(url.hostname) || url.pathname.includes('firebasejs')) return; // Firebase 등
    event.respondWith(hit(request.url).then(h => h || fetch(request).then(res => { if (res.ok || res.type === 'opaque') put(RT, request.url, res.clone()); return res; })));
    return;
  }
  if (url.searchParams.has('vc')) return; // 새 버전 확인
  if (request.headers.has('range')) { // 배경음악 (audio 는 범위 요청): 네트워크 · 처음 들은 곡은 통째로 받아 두고 · 오프라인이면 받아 둔 곡
    const key = url.origin + url.pathname;
    const net = fetch(request);
    event.respondWith(net.catch(() => hit(key).then(h => h || Response.error())));
    event.waitUntil(net.then(() => hit(key)).then(h => h || fetch(key).then(full => { if (full.ok) return put(RT, key, full); })).catch(() => {})); // 처음 한 번만 통째로
    return;
  }
  const isPage = request.mode === 'navigate';
  // 페이지는 쿼리(미리보기 등)와 상관없이 하나의 사본만 둔다
  const key = isPage ? new URL('./', self.registration.scope).href : url.origin + url.pathname;
  event.respondWith(
    (isPage ? fetch(request.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' }) : fetch(request)).then(response => { // 페이지는 HTTP 캐시를 다시 확인 (GitHub Pages 10분 캐시 때문에 옛 버전이 뜨던 문제 · R2.12.3)
      if (response.ok && response.type === 'basic') put(isPage ? CACHE : RT, key, response.clone()); // 페이지 · 쓴 파일은 새 사본으로 (오프라인이면 caches.match 가 어느 쪽이든 찾는다)
      return response;
    }).catch(() => hit(key).then(h => h || (isPage ? hit(new URL('./', self.registration.scope).href) : null)).then(h => h || Response.error()))
  );
});
