// RE : 지후배틀 앱 (R2.26): 게임 파일을 app/www 로 복사 — node tools/app-sync.js (app 폴더의 npm run sync 가 부른다)
// 넣는 것: index.html · manifest · 아이콘 · 효과음 · 배경음악 · 만화 · 이모티콘 · R1 지후 (크레딧) — 인포그래픽 · 도구 · 문서 · 초상화 원본은 빼고
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'app', 'www');
const FILES = ['index.html', 'manifest.webmanifest'], DIRS = ['icons', 'sfx', 'bgm', 'comic', 'emo', 'r1jihoo'];
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
let n = 0, size = 0;
const cp = (src, dst) => { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); n++; size += fs.statSync(src).size; };
const walk = (rel) => { for (const f of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) { const r = path.join(rel, f.name); if (f.isDirectory()) walk(r); else cp(path.join(ROOT, r), path.join(OUT, r)); } };
FILES.forEach(f => cp(path.join(ROOT, f), path.join(OUT, f))); DIRS.forEach(walk);
const v = (/<meta name="jihoo-version" content="([^"]+)"/.exec(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')) || [])[1];
console.log(`app/www: ${n}개 · ${(size / 1048576).toFixed(1)}MB · 게임 ${v}`);
