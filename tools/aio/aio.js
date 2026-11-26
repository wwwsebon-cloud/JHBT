#!/usr/bin/env node
// 올인원 패치 (R3.7) — 바탕화면 JHBT-올인원.bat 이 연다 · 메뉴에서 고르면 순서대로 한다
//   1 전체: 인포그래픽 → 커밋 → GitHub 푸시 → Firebase 규칙 게시 → 디스코드 공지 (Threads X)
//   2 푸시 · 3 규칙 게시 · 4 디스코드 공지 · 5 인포그래픽 · 6 티어리스트 (시뮬 · 오래 걸림) · 7 딸깍 패치기
//   인포그래픽은 자동판 (notes2json 그대로 · 남색 클래식) — 이미 만든 파일 (덱 레이아웃 등) 이 있으면 덮을지 묻는다
const fs = require('fs'), path = require('path'), os = require('os'), readline = require('readline'), { spawn, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REPO_RAW = 'https://raw.githubusercontent.com/wwwsebon-cloud/JHBT/main/';
const ENV = { ...process.env, PYTHONIOENCODING: 'utf-8', CHROME };
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, a => r(a.trim())));
const yes = async (q, def = true) => { const a = (await ask(q + (def ? ' [Y/n] ' : ' [y/N] '))).toLowerCase(); return a ? a.startsWith('y') || a === 'ㅛ' : def; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const line = t => console.log('\n━━━ ' + t + ' ' + '━'.repeat(Math.max(4, 40 - t.length)));
function sh(cmd, args, opt = {}) { // 화면에 그대로 보이며 실행
  console.log('  $ ' + [cmd, ...args].join(' '));
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: opt.quiet ? 'pipe' : 'inherit', env: ENV, encoding: 'utf8', shell: false });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}
const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
const gitOut = (...a) => (git(...a).stdout || '').trim();
function meta() { const s = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').slice(0, 4000); return { v: (/jihoo-version" content="([^"]+)"/.exec(s) || [])[1], b: +(/jihoo-build" content="(\d+)"/.exec(s) || [])[1] }; }
const todayKST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '.');

async function serverUp() { try { const r = await fetch('http://127.0.0.1:8766/index.html', { method: 'HEAD' }); return r.ok; } catch (e) { return false; } }
async function withServer(fn) { // 로컬 서버 (python -m http.server 8766) 를 켜고 끈다
  let ch = null; if (!(await serverUp())) { ch = spawn('python', ['-m', 'http.server', '8766'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await serverUp()); i++) await sleep(250); }
  try { return await fn(); } finally { if (ch) ch.kill(); }
}
function mainOnly() { const b = gitOut('branch', '--show-current'); if (b !== 'main') { console.log(`  ✖ 지금 브랜치가 main 이 아니에요 (${b}) — main 으로 돌아온 뒤 다시`); return false; } return true; }

// ── 단계 ──
async function stepInfo() {
  line('인포그래픽'); const { v, b } = meta(), name = b > 1 ? `${v}-b${b}` : v, J = path.join(ROOT, 'infographics', name + '.json');
  if (fs.existsSync(path.join(ROOT, 'infographics', name + '.png')) && !(await yes(`  ${name}.png 가 이미 있어요 (직접 만든 덱일 수 있어요). 자동판으로 다시 만들까요?`, false))) { console.log('  → 그대로 둡니다'); return true; }
  const D = path.join(ROOT, 'infographics'), mine = new RegExp('^' + name.replace(/\./g, '\\.') + '(?:-\\d+)?\\.(?:png|html)$');
  fs.readdirSync(D).filter(f => mine.test(f)).forEach(f => fs.unlinkSync(path.join(D, f))); /* 예전 장 (덱이 더 길었으면 -3 · -4 …) 이 섞이지 않게 */
  return withServer(async () => {
    if (!sh('node', ['infographics/extract.js']).ok) return false;
    const VJ = path.join(ROOT, 'infographics', v + '.json'), keep = b > 1 && fs.existsSync(VJ) ? fs.readFileSync(VJ) : null;
    if (!sh('node', ['infographics/notes2json.js', v]).ok) return false;
    if (b > 1) { const d = JSON.parse(fs.readFileSync(VJ, 'utf8')); d.sections = (d.sections || []).slice(0, 1); d.title = (d.sections[0] && d.sections[0].title) || d.title; fs.writeFileSync(J, JSON.stringify(d, null, 1)); if (keep) fs.writeFileSync(VJ, keep); else fs.unlinkSync(VJ); }
    if (!sh('python', ['infographics/make.py', J]).ok) return false;
    if (!sh('python', ['infographics/shot.py', `infographics/${name}*.html`]).ok) return false;
    const pngs = fs.readdirSync(path.join(ROOT, 'infographics')).filter(f => f.startsWith(name) && /\.png$/.test(f) && (f === name + '.png' || new RegExp('^' + name.replace(/\./g, '\\.') + '-\\d+\\.png$').test(f)));
    console.log('  ✔ ' + pngs.join(' · ')); return true;
  });
}
function stepCommitInfo() {
  line('인포그래픽 커밋'); if (!mainOnly()) return false; const { v, b } = meta(), name = b > 1 ? `${v}-b${b}` : v;
  sh('git', ['add', '--', `infographics/${name}*`]);
  if (!gitOut('diff', '--cached', '--name-only')) { console.log('  커밋할 새 파일이 없어요'); return true; }
  return sh('git', ['commit', '-m', `${v} build ${b} 인포그래픽 (올인원)`]).ok;
}
function stepPush() { line('GitHub 푸시'); if (!mainOnly()) return false; const r = sh('git', ['push', 'origin', 'main']); console.log(r.ok ? '  ✔ 푸시 완료' : '  ✖ 푸시 실패'); return r.ok; }
function stepRules() { line('Firebase 규칙 게시'); const r = sh('node', ['tools/rules-deploy.js']); console.log(r.ok ? '  ✔ 규칙 게시 (서버와 같으면 그대로)' : '  ✖ 규칙 게시 실패 — 위 메시지 확인'); return r.ok; }
async function stepDiscord() {
  line('디스코드 공지'); const { v, b } = meta(), name = b > 1 ? `${v}-b${b}` : v, png = `infographics/${name}.png`;
  if (fs.existsSync(path.join(ROOT, png))) { // 푸시 직후 GitHub raw 주소가 열릴 때까지 (CDN) 기다린다
    process.stdout.write('  이미지 주소 확인 중'); let ok = false;
    for (let i = 0; i < 40 && !ok; i++) { try { ok = (await fetch(REPO_RAW + encodeURI(png), { method: 'HEAD' })).ok; } catch (e) {} if (!ok) { process.stdout.write('.'); await sleep(8000); } }
    console.log(ok ? ' ✔' : ' (아직 안 열림 — 그래도 올려요)');
  }
  if (!(await yes('  디스코드에 올릴까요? (먼저 --dry 로 글을 보여 줘요)'))) return true;
  sh('node', ['tools/post-patch.js', '--only', 'discord', '--dry']);
  if (!(await yes('  위 내용으로 올릴까요?'))) return true;
  const r = sh('node', ['tools/post-patch.js', '--only', 'discord']); console.log(r.ok ? '  ✔ 디스코드 공지 완료' : '  ✖ 공지 실패'); return r.ok;
}
async function stepTier() {
  line('티어리스트 (시뮬)'); if (!mainOnly()) return false; const { v } = meta();
  const games = +(await ask('  판 수 (기본 1600 · 일꾼 2개면 몇 분): ')) || 1600, W = path.join(os.tmpdir(), 'jhbt-tier-' + v.replace(/\W/g, '') + '-' + Date.now());
  fs.mkdirSync(W, { recursive: true });
  return withServer(async () => {
    console.log(`  일꾼 2개 · ${games}판 · 작업 폴더 ${W}`);
    const run1 = i => new Promise(r => { const c = spawn('node', ['tools/tierlist/run-cdp.js', W, String(i), '2', String(games)], { cwd: ROOT, stdio: 'inherit', env: ENV }); c.on('exit', code => r(code === 0)); });
    let ok = (await Promise.all([run1(0), run1(1)])).every(Boolean);
    if (!ok) { console.log('  일꾼이 멈췄어요 — 한 번 더 (이어하기)'); ok = (await Promise.all([run1(0), run1(1)])).every(Boolean); }
    if (!ok) { console.log('  ✖ 시뮬 실패'); return false; }
    if (!sh('node', ['tools/tierlist/agg.js', W, '100']).ok) return false;
    if (!sh('python', ['tools/tierlist/apply.py', W, v, todayKST()]).ok) return false;
    if (!sh('python', ['infographics/make.py', `infographics/tier-${v}.json`]).ok) return false;
    if (!sh('python', ['infographics/shot.py', `infographics/tier-${v}*.html`]).ok) return false;
    sh('git', ['add', 'index.html', 'tools/tierlist/history', '--', `infographics/tier-${v}*`]);
    const c = sh('git', ['commit', '-m', `${v} 티어표 (${games}판 · 올인원)`]); console.log(c.ok ? '  ✔ 티어표 커밋 (TIER_SC 바뀜 · 푸시는 2번)' : '  커밋할 것이 없어요'); return true;
  });
}
function stepPatcher() { line('딸깍 패치기'); const c = spawn('node', ['tools/patcher/server.js'], { cwd: ROOT, stdio: 'inherit', env: ENV }); console.log('  브라우저가 열려요 · 이 창에서 Ctrl+C 로 끄고 메뉴로'); return new Promise(r => c.on('exit', () => r(true))); }

async function all() {
  const { v, b } = meta(); console.log(`\n  ${v} build ${b} 를 올립니다: 인포그래픽 → 커밋 → 푸시 → 규칙 게시 → 디스코드 공지`);
  if (!(await yes('  시작할까요?'))) return;
  for (const [n, f] of [['인포그래픽', stepInfo], ['커밋', stepCommitInfo], ['푸시', stepPush], ['규칙', stepRules], ['디스코드', stepDiscord]]) {
    const ok = await f(); if (!ok && !(await yes(`  ${n} 단계가 실패했어요. 계속할까요?`, false))) return;
  }
  line('끝'); console.log('  ✔ 올인원 완료');
}
(async () => {
  for (;;) {
    const { v, b } = meta(), dirty = gitOut('status', '--porcelain', '--', 'index.html'), ahead = gitOut('rev-list', '--count', 'origin/main..main');
    console.log(`\n══ RE:JHBT 올인원 · ${v} build ${b} · 브랜치 ${gitOut('branch', '--show-current')}${ahead && ahead !== '0' ? ` · 안 올린 커밋 ${ahead}개` : ''}${dirty ? ' · index.html 커밋 안 됨' : ''} ══`);
    console.log('  1  전체 (인포그래픽 → 커밋 → 푸시 → 규칙 게시 → 디스코드 공지)\n  2  GitHub 푸시\n  3  Firebase 규칙 게시\n  4  디스코드 공지\n  5  인포그래픽 만들기\n  6  티어리스트 만들기 (시뮬 · 오래 걸림)\n  7  딸깍 패치기\n  8  하루 총정리 공지 (디스코드 · today-<날짜>.json 이 있을 때)\n  0  끝');
    const k = await ask('> ');
    try {
      if (k === '1') await all(); else if (k === '2') stepPush(); else if (k === '3') stepRules(); else if (k === '4') await stepDiscord();
      else if (k === '5') { if (await stepInfo() && await yes('  커밋할까요?')) stepCommitInfo(); } else if (k === '6') await stepTier(); else if (k === '7') await stepPatcher(); else if (k === '8') { line('하루 총정리 공지'); sh('node', ['tools/post-patch.js', '--day', '--only', 'discord', '--dry']); if (await yes('  위 내용으로 디스코드에 올릴까요?')) sh('node', ['tools/post-patch.js', '--day', '--only', 'discord']); }
      else if (k === '0' || k === '') break;
    } catch (e) { console.log('  ✖ ' + (e.stack || e)); }
  }
  rl.close(); process.exit(0);
})();
