// 배포 · 공지 작업 (R3.7) — 딸깍 패치기 화면의 「배포 · 공지」 탭이 부른다 (예전 올인원 배치 메뉴를 옮김)
//   작업은 한 번에 하나 · 출력은 줄 단위로 모아 화면이 0.7초마다 가져간다
//   올리기 (디스코드 · Threads) 는 화면에서 먼저 미리보기 (--dry) 를 보고 「이대로 올리기」를 눌러야 진짜로 올린다
const fs = require('fs'), path = require('path'), os = require('os'), { spawn, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REPO_RAW = 'https://raw.githubusercontent.com/wwwsebon-cloud/JHBT/main/';
const ENV = { ...process.env, PYTHONIOENCODING: 'utf-8', CHROME };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const gitOut = (...a) => (spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' }).stdout || '').trim();
const todayKST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '.');
function meta() { const s = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').slice(0, 4000); return { v: (/jihoo-version" content="([^"]+)"/.exec(s) || [])[1], b: +(/jihoo-build" content="(\d+)"/.exec(s) || [])[1] }; }
const imgName = () => { const { v, b } = meta(); return b > 1 ? `${v}-b${b}` : v; };

function status() {
  const { v, b } = meta(), name = imgName(), D = path.join(ROOT, 'infographics');
  gitOut('fetch', '-q', 'origin', 'main');
  const pngs = fs.readdirSync(D).filter(f => new RegExp('^' + name.replace(/\./g, '\\.') + '(?:-\\d+)?\\.png$').test(f)).sort();
  const day = 'today-' + todayKST().replace(/\./g, '-');
  return { version: v, build: b, branch: gitOut('branch', '--show-current'), ahead: +gitOut('rev-list', '--count', 'origin/main..main') || 0, behind: +gitOut('rev-list', '--count', 'main..origin/main') || 0,
    dirty: gitOut('status', '--porcelain').split('\n').filter(Boolean).slice(0, 12), img: name, pngs, day, dayJson: fs.existsSync(path.join(D, day + '.json')), dayPng: fs.existsSync(path.join(D, day + '.png')), job: JOB && !JOB.done ? JOB.kind : null };
}

// ── 작업 실행기 ──
let JOB = null, SEQ = 0;
function start(kind, opt) {
  if (JOB && !JOB.done) throw new Error(`지금 「${JOB.title}」 작업 중이에요`);
  const W = WORK[kind]; if (!W) throw new Error('모르는 작업: ' + kind);
  const j = JOB = { id: ++SEQ, kind, title: W.title, lines: [], done: false, ok: false, t0: Date.now() };
  const log = s => String(s).split(/\r?\n/).forEach(l => { if (l.trim()) j.lines.push(l); });
  const ctx = { log, opt: opt || {}, run: (cmd, args) => runCmd(cmd, args, log) };
  log(`▶ ${W.title}`);
  W.fn(ctx).then(ok => { j.ok = ok !== false; }, e => { log('✖ ' + (e.message || e)); j.ok = false; }).finally(() => { j.done = true; log(j.ok ? `✔ 끝 (${Math.round((Date.now() - j.t0) / 1000)}초)` : '✖ 실패'); });
  return j.id;
}
function runCmd(cmd, args, log) {
  log('$ ' + [cmd, ...args].join(' '));
  return new Promise(res => { const c = spawn(cmd, args, { cwd: ROOT, env: ENV }); let buf = '';
    const eat = d => { buf += d.toString('utf8'); const p = buf.split(/\r?\n/); buf = p.pop(); p.forEach(l => log('  ' + l)); };
    c.stdout.on('data', eat); c.stderr.on('data', eat); c.on('error', e => log('  ' + e.message)); c.on('close', code => { if (buf) log('  ' + buf); res(code === 0); }); });
}
const poll = (id, from) => (JOB && JOB.id === id ? { id, lines: JOB.lines.slice(from), next: JOB.lines.length, done: JOB.done, ok: JOB.ok } : { id, lines: [], next: from, done: true, ok: false });

// ── 로컬 서버 (인포그래픽 · 티어) ──
async function up() { try { return (await fetch('http://127.0.0.1:8766/index.html', { method: 'HEAD' })).ok; } catch (e) { return false; } }
async function withServer(log, fn) { let ch = null; if (!(await up())) { log('로컬 서버 켜기 (8766)'); ch = spawn('python', ['-m', 'http.server', '8766'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); } try { return await fn(); } finally { if (ch) ch.kill(); } }
const mainOnly = log => { const b = gitOut('branch', '--show-current'); if (b !== 'main') { log(`✖ 지금 브랜치가 main 이 아니에요 (${b})`); return false; } return true; };

async function infographic({ log, run, opt }) {
  const { v, b } = meta(), name = imgName(), D = path.join(ROOT, 'infographics'), J = path.join(D, name + '.json');
  if (fs.existsSync(path.join(D, name + '.png')) && !opt.overwrite) { log(`${name}.png 가 이미 있어요 → 그대로 둡니다 (다시 만들려면 「덮어쓰기」를 켜세요)`); return true; }
  const mine = new RegExp('^' + name.replace(/\./g, '\\.') + '(?:-\\d+)?\\.(?:png|html)$'); fs.readdirSync(D).filter(f => mine.test(f)).forEach(f => fs.unlinkSync(path.join(D, f)));
  return withServer(log, async () => {
    if (!(await run('node', ['infographics/extract.js']))) return false;
    const VJ = path.join(D, v + '.json'), keep = b > 1 && fs.existsSync(VJ) ? fs.readFileSync(VJ) : null;
    if (!(await run('node', ['infographics/notes2json.js', v]))) return false;
    if (b > 1) { const d = JSON.parse(fs.readFileSync(VJ, 'utf8')); d.sections = (d.sections || []).slice(0, 1); d.title = (d.sections[0] && d.sections[0].title) || d.title; fs.writeFileSync(J, JSON.stringify(d, null, 1)); if (keep) fs.writeFileSync(VJ, keep); else fs.unlinkSync(VJ); }
    if (!(await run('python', ['infographics/make.py', J]))) return false;
    return run('python', ['infographics/shot.py', `infographics/${name}*.html`]);
  });
}
async function commitInfo({ log, run }) {
  if (!mainOnly(log)) return false; const { v, b } = meta(), name = imgName();
  await run('git', ['add', '--', `infographics/${name}*`]);
  if (!gitOut('diff', '--cached', '--name-only')) { log('커밋할 새 인포그래픽이 없어요'); return true; }
  return run('git', ['commit', '-m', `${v} build ${b} 인포그래픽 (딸깍 패치기)`]);
}
async function push({ log, run }) { if (!mainOnly(log)) return false; return run('git', ['push', 'origin', 'main']); }
async function rules({ run, opt }) { return run('node', ['tools/rules-deploy.js', ...(opt.dry ? ['--dry'] : [])]); }
async function waitRaw(log, file) {
  if (!fs.existsSync(path.join(ROOT, file))) return; log('이미지 주소 확인 중 (푸시 뒤 GitHub 가 열어 줄 때까지)');
  for (let i = 0; i < 40; i++) { try { if ((await fetch(REPO_RAW + encodeURI(file), { method: 'HEAD' })).ok) { log('  이미지 주소 열림'); return; } } catch (e) {} await sleep(8000); }
  log('  아직 안 열렸어요 — 그래도 진행');
}
async function post({ log, run, opt }) { // opt: { to: ['discord','threads'], day, dry }
  const to = (opt.to || []).filter(x => ['discord', 'threads', 'instagram'].includes(x)); if (!to.length) { log('올릴 곳을 고르세요'); return false; }
  const base = [...(opt.day ? ['--day'] : [])];
  if (!opt.dry) await waitRaw(log, opt.day ? `infographics/${status().day}.png` : `infographics/${imgName()}.png`);
  let ok = true; for (const t of to) ok = (await run('node', ['tools/post-patch.js', ...base, '--only', t, ...(opt.dry ? ['--dry'] : [])])) && ok;
  return ok;
}
async function tier({ log, run, opt }) {
  if (!mainOnly(log)) return false; const { v } = meta(), games = Math.max(100, +opt.games || 1600), W = path.join(os.tmpdir(), 'jhbt-tier-' + Date.now()); fs.mkdirSync(W, { recursive: true });
  return withServer(log, async () => {
    log(`일꾼 2개 · ${games}판`);
    const two = () => Promise.all([0, 1].map(i => runCmd('node', ['tools/tierlist/run-cdp.js', W, String(i), '2', String(games)], log)));
    let ok = (await two()).every(Boolean); if (!ok) { log('일꾼이 멈췄어요 — 이어서 한 번 더'); ok = (await two()).every(Boolean); } if (!ok) return false;
    for (const [c, a] of [['node', ['tools/tierlist/agg.js', W, '100']], ['python', ['tools/tierlist/apply.py', W, v, todayKST()]], ['python', ['infographics/make.py', `infographics/tier-${v}.json`]], ['python', ['infographics/shot.py', `infographics/tier-${v}*.html`]]]) if (!(await run(c, a))) return false;
    await run('git', ['add', 'index.html', 'tools/tierlist/history', '--', `infographics/tier-${v}*`]);
    await run('git', ['commit', '-m', `${v} 티어표 (${games}판 · 딸깍 패치기)`]); log('티어표 커밋 (TIER_SC 바뀜) · 푸시는 따로'); return true;
  });
}
async function all(ctx) { // 인포그래픽 → 커밋 → 푸시 → 규칙 → (공지는 화면에서 미리보기 뒤)
  for (const [n, f] of [['인포그래픽', infographic], ['인포그래픽 커밋', commitInfo], ['GitHub 푸시', push], ['Firebase 규칙 게시', rules]]) { ctx.log(`── ${n}`); if (!(await f(ctx))) { ctx.log(`✖ ${n} 에서 멈췄어요`); return false; } }
  ctx.log('── 공지는 아래 「미리보기」 → 「이대로 올리기」로'); return true;
}
const WORK = { all: { title: '한 번에 (인포그래픽 → 커밋 → 푸시 → 규칙)', fn: all }, info: { title: '인포그래픽 만들기', fn: infographic }, commitInfo: { title: '인포그래픽 커밋', fn: commitInfo },
  push: { title: 'GitHub 푸시', fn: push }, rules: { title: 'Firebase 규칙 게시', fn: rules }, post: { title: '공지 올리기', fn: post }, tier: { title: '티어리스트 (시뮬)', fn: tier } };

module.exports = { status, start, poll };
