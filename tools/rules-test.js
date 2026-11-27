#!/usr/bin/env node
// firestore.rules 시험 — Firebase 규칙 시험 API (projects.test) 로 「허용돼야 하는 쓰기 · 거절돼야 하는 쓰기」를 확인한다
//   node tools/rules-test.js [--key <서비스 계정 JSON>]
// 게시하지 않고 · 데이터를 읽거나 쓰지 않고 · 계정도 만들지 않는다 (가짜 요청을 규칙에 대입해 볼 뿐)
// 한계: 시험 API 는 시각 값을 만들 수 없어 `updatedAt is timestamp` · `== request.time` 검사는 참으로 바꾸고 시험한다
const fs = require('fs'), path = require('path');
const { loadKey, accessToken, call } = require('./sa');

const src = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
  .replace(/request\.resource\.data\.(updatedAt|at|created) is timestamp/g, 'true')
  .replace(/request\.resource\.data\.(updatedAt|at|created) == request\.time/g, 'true');

const DB = '/databases/(default)/documents', NOW = '2026-12-01T03:00:00Z';
const SEASON = Math.floor((Date.parse(NOW) - 1792767600000) / 1209600000) + 1;
const auth = uid => ({ uid, token: { firebase: { sign_in_provider: 'password' } } });
const mock = (fn, p, value) => ({ function: fn, args: [{ exactValue: DB + p }], result: { value } });
const base = (uid, sid) => [
  mock('exists', '/bans/' + uid, false), mock('exists', '/admins/' + uid, false),
  mock('get', '/sessions/' + uid, { data: { sid } }),
  mock('exists', '/nicknames/n_tester', false),
];
const T = [];
function test(name, expectation, { method = 'update', p, data, old, uid = 'u1', sid = 'S1', mocks }) {
  const request = { auth: auth(uid), path: DB + p, method, time: NOW }; if (data) request.resource = { data };
  const c = { expectation, request, functionMocks: mocks || base(uid, sid) }; if (old) c.resource = { data: old };
  T.push({ name, c });
}

const led = { dia: 100, gold: 200, pulls: 10, own: 5 };
const doc = extra => ({ payload: '{}', savedAt: 1, updatedAt: 'x', ...extra });
const B = '/r2_backups/u1';
test('새 계정 첫 저장 (rev 1)', 'ALLOW', { method: 'create', p: B, data: doc({ rev: 1, sid: 'S1', led }) });
test('다음 저장 (rev +1)', 'ALLOW', { p: B, data: doc({ rev: 8, sid: 'S1', led }), old: doc({ rev: 7, sid: 'S0', led }) });
test('rev 없는 옛 기록 → 새 방식', 'ALLOW', { p: B, data: doc({ rev: 1, sid: 'S1', led }), old: doc({}) });
test('옛 화면 · 아직 rev 가 없는 계정', 'ALLOW', { p: B, data: doc({}), old: doc({}) });
test('낡은 rev (두 번째 기기)', 'DENY', { p: B, data: doc({ rev: 7, sid: 'S1', led }), old: doc({ rev: 7, sid: 'S0', led }) });
test('rev 건너뛰기', 'DENY', { p: B, data: doc({ rev: 100, sid: 'S1', led }), old: doc({ rev: 7, sid: 'S0', led }) });
test('다른 창이 접속한 뒤 (sid 다름)', 'DENY', { p: B, data: doc({ rev: 8, sid: 'S0', led }), old: doc({ rev: 7, sid: 'S0', led }), sid: 'S1' });
test('새 방식 계정에 옛 방식 쓰기', 'DENY', { p: B, data: doc({}), old: doc({ rev: 7, sid: 'S0', led }) });
test('장부 없이', 'DENY', { p: B, data: doc({ rev: 8, sid: 'S1' }), old: doc({ rev: 7, sid: 'S0', led }) });
test('음수 장부', 'DENY', { p: B, data: doc({ rev: 8, sid: 'S1', led: { ...led, dia: -1 } }), old: doc({ rev: 7, sid: 'S0', led }) });
test('기록 삭제', 'DENY', { method: 'delete', p: B, old: doc({ rev: 7, sid: 'S0', led }) });
test('남의 기록 쓰기', 'DENY', { p: B, uid: 'u2', data: doc({ rev: 8, sid: 'S1', led }), old: doc({ rev: 7, sid: 'S0', led }) });
test('정지된 계정', 'DENY', { p: B, data: doc({ rev: 8, sid: 'S1', led }), old: doc({ rev: 7, sid: 'S0', led }),
  mocks: [mock('exists', '/bans/u1', true), mock('get', '/bans/u1', { data: { until: 0 } }), mock('get', '/sessions/u1', { data: { sid: 'S1' } })] });

const lb = extra => ({ nickname: 'tester', level: 3, wins: 1, losses: 0, deck: [], fav: '', xp: 0, dia: 1, gold: 1, pulls: 0, own: 5, cheat: 0, updatedAt: 'x', ...extra });
test('순위 올리기', 'ALLOW', { method: 'create', p: '/r2lb/u1', data: lb() });
{ const d = lb(); delete d.dia; test('순위에서 재화 칸 빼기', 'DENY', { method: 'create', p: '/r2lb/u1', data: d }); }
const comp = s => ({ nickname: 'tester', tp: 100, season: s, wins: 1, losses: 0, fav: '', updatedAt: 'x' });
test('경쟁전 이번 시즌', 'ALLOW', { method: 'create', p: `/r2comp/${SEASON}_u1`, data: comp(SEASON) });
test('경쟁전 지난 시즌', 'DENY', { method: 'create', p: `/r2comp/${SEASON - 1}_u1`, data: comp(SEASON - 1) });
test('우편 수령 표시 다시 쓰기', 'DENY', { p: '/giftMail/g1/claims/u1', data: { name: 'tester', at: 'x' }, old: { name: 'tester', at: 'x' },
  mocks: [...base('u1', 'S1'), mock('get', '/giftMail/g1', { data: { to: 'all' } })] });

(async () => {
  const sa = loadKey(), tk = await accessToken(sa, 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform');
  const res = await call(tk, 'POST', `https://firebaserules.googleapis.com/v1/projects/${sa.project_id}:test`, { source: { files: [{ name: 'firestore.rules', content: src }] }, testSuite: { testCases: T.map(t => t.c) } });
  if (res.issues && res.issues.some(i => i.severity === 'ERROR')) { res.issues.forEach(i => console.error(`✘ ${i.sourcePosition ? i.sourcePosition.line + '번째 줄: ' : ''}${i.description}`)); process.exit(1); }
  let bad = 0;
  (res.testResults || []).forEach((r, i) => { const ok = r.state === 'SUCCESS'; if (!ok) bad++; console.log(`${ok ? '✔' : '✘'} [${T[i].c.expectation}] ${T[i].name}${ok ? '' : ' — ' + (r.debugMessages || []).join(' / ').slice(0, 300)}`); });
  if ((res.testResults || []).length !== T.length) { console.error('✘ 결과 개수가 달라요'); process.exit(1); }
  console.log(bad ? `실패 ${bad} / ${T.length}` : `모두 통과 (${T.length})`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('✘ ' + (e.message || e)); process.exit(1); });
