// 지후배틀 서비스 워커 — 앱 설치(PWA)와 오프라인 실행용.
// 항상 네트워크를 먼저 쓰고, 연결이 없을 때만 마지막으로 받은 사본을 보여준다.
// 그래서 새 버전 배포가 늦게 보이는 일이 없다. 버전 확인 요청(?vc=)과 Firebase 같은 외부 요청은 건드리지 않는다.
const CACHE = 'jihoo-battle-v2';
const SHELL = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firebase·폰트 CDN 등
  if (url.searchParams.has('vc') || request.headers.has('range')) return; // 새 버전 확인
  const isPage = request.mode === 'navigate';
  // 페이지는 쿼리(미리보기 등)와 상관없이 하나의 사본만 둔다
  const key = isPage ? new URL('./', self.registration.scope).href : request.url;
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && (isPage || SHELL.some(path => url.pathname.endsWith(path.replace('./', ''))))) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(key, copy)).catch(() => {});
      }
      return response;
    }).catch(() => caches.match(key).then(hit => hit || Response.error()))
  );
});
