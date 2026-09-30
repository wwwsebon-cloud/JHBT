// 지후배틀 → 디스코드 알림 중계 (Cloudflare Worker)
// 게임은 웹후크 주소를 모른다. 로그인한 플레이어의 Firebase ID 토큰을 붙여 여기로 보내면,
// 토큰을 검사한 뒤 정해진 모양의 메시지만 디스코드로 넘긴다.
//
// 비밀값 (wrangler secret put DISCORD_WEBHOOK_URL): 디스코드 웹후크 주소
// 변수 (wrangler.toml [vars]): FIREBASE_PROJECT_ID, ALLOWED_ORIGINS(쉼표로 구분)

const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const COLORS = { win: 0x1f9d55, lose: 0xe5322d, draw: 0x8a8a87, join: 0x2f6fed, legend: 0xf2c94c, promo: 0x9b59d0, level: 0x14b8a6, streak: 0xf08c00 };
const MODES = { ranked: '랭크전', competitive: '경쟁전', draftbattle: '드래프트전' };
// 같은 플레이어가 너무 자주 보내지 못하게 (워커 인스턴스 안에서만 기억하는 간단한 제한)
const COOLDOWN_MS = { join: 10 * 60 * 1000, legend: 3000, match: 15000, promo: 10000, level: 5000, streak: 15000 };
const lastSent = new Map();
let jwkCache = { keys: null, until: 0 };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin'
    };
    const reply = (status, text) => new Response(text, { status, headers: cors });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, 'POST only');
    if (allowed.length && !allowed.includes(origin)) return reply(403, 'origin');
    if (!env.DISCORD_WEBHOOK_URL) return reply(500, 'webhook not set');

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    let uid;
    try { uid = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID || 'jihoobattle'); } catch (error) { return reply(401, 'token'); }

    let body;
    try { body = await request.json(); } catch (error) { return reply(400, 'json'); }
    const embed = buildEmbed(body);
    if (!embed) return reply(400, 'type');

    const key = uid + ':' + body.type;
    const now = Date.now();
    if (now - (lastSent.get(key) || 0) < (COOLDOWN_MS[body.type] || 5000)) return reply(429, 'slow down');
    lastSent.set(key, now);
    if (lastSent.size > 5000) lastSent.clear();

    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '지후배틀', allowed_mentions: { parse: [] }, embeds: [embed] })
    });
    return reply(res.ok ? 204 : 502, res.ok ? null : 'discord ' + res.status);
  }
};

// ---- 메시지 모양 ----
// 플레이어가 보낸 글자는 짧게 자르고, 디스코드 서식·멘션이 먹지 않게 막는다
function clean(value, max = 24) {
  const text = String(value ?? '').replace(/[\u0000-\u001f]/g, '').replace(/https?:\/\//gi, '').trim().slice(0, max);
  return text.replace(/([\\*_~`|>#\[\]])/g, '\\$1').replace(/@/g, '@\u200b');
}
// 필드 제목은 서식이 먹지 않으니 이스케이프 없이 자르기만 한다
function plain(value, max = 24) {
  return String(value ?? '').replace(/[\u0000-\u001f]/g, '').replace(/@/g, '@\u200b').trim().slice(0, max);
}
function list(value, max = 8) {
  return Array.isArray(value) ? value.slice(0, max).map(v => clean(v, 24)).filter(Boolean) : [];
}
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function buildEmbed(body) {
  if (!body || typeof body !== 'object') return null;
  const nick = clean(body.nickname, 12) || '플레이어';
  const at = new Date().toISOString();
  if (body.type === 'join') {
    return { color: COLORS.join, description: `🎉 **${nick}** 님이 지후배틀에 가입했어요!`, timestamp: at };
  }
  if (body.type === 'legend') {
    const name = clean(body.name, 20);
    if (!name) return null;
    return { color: COLORS.legend, description: `🌟 **${nick}** 님이 전설 지후 **${name}** 획득!`, timestamp: at };
  }
  if (body.type === 'promo') {
    const tier = clean(body.tier, 16);
    if (!tier) return null;
    return { color: COLORS.promo, description: `🏅 **${nick}** 님이 경쟁전 **${tier}** 승급!`, timestamp: at };
  }
  if (body.type === 'level') {
    const level = num(body.level);
    if (!level || level < 2 || level > 999) return null;
    return { color: COLORS.level, description: `⬆️ **${nick}** 님이 **Lv.${level}** 달성!`, timestamp: at };
  }
  if (body.type === 'streak') {
    const streak = num(body.streak);
    if (!streak || streak < 3 || streak > 9999) return null;
    const mode = clean(body.mode, 10);
    return { color: COLORS.streak, description: `🔥 **${nick}** 님 **${streak}연승** 중!${mode ? ` (${mode})` : ''}`, timestamp: at };
  }
  if (body.type === 'match') {
    const mode = MODES[body.mode];
    const result = ['win', 'lose', 'draw'].includes(body.result) ? body.result : null;
    if (!mode || !result) return null;
    const head = result === 'win' ? '🏆 승리' : result === 'lose' ? '💀 패배' : '🤝 무승부';
    const enemy = clean(body.enemyName, 16) || '상대';
    const score = /^\d{1,2}:\d{1,2}$/.test(String(body.score || '')) ? ` · ${body.score}` : '';
    const level = num(body.level);
    const fields = [];
    const nickPlain = plain(body.nickname, 12) || '플레이어', enemyPlain = plain(body.enemyName, 16) || '상대';
    const deck = (label, names) => { const l = list(names); if (l.length) fields.push({ name: label, value: l.join('\n'), inline: true }); };
    deck(`${nickPlain}${level ? ` (Lv.${level})` : ''}`, body.myDeck);
    deck(enemyPlain, body.enemyDeck);
    const mvp = (label, m) => {
      if (!m || typeof m !== 'object') return;
      const name = clean(m.name, 20), dealt = num(m.dealt), kills = num(m.kills);
      if (!name) return;
      fields.push({ name: label, value: `**${name}**${dealt != null ? ` · ${fmt(Math.max(0, dealt))} 피해` : ''}${kills != null ? ` · ${Math.max(0, kills)}처치` : ''}`, inline: false });
    };
    mvp('⭐ MVP', body.mvp);
    mvp('상대 MVP', body.enemyMvp);
    const extra = clean(body.extra, 60);
    if (extra) fields.push({ name: '결과', value: extra, inline: false });
    return {
      color: COLORS[result],
      title: `${head} · ${mode}${body.surrendered ? ' (항복)' : ''}`,
      description: `**${nick}** vs **${enemy}**${score}`,
      fields,
      timestamp: at
    };
  }
  return null;
}

// ---- Firebase ID 토큰 검사 (RS256) ----
function b64urlBytes(text) {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function b64urlJson(text) {
  return JSON.parse(new TextDecoder().decode(b64urlBytes(text)));
}
async function googleKeys() {
  if (jwkCache.keys && Date.now() < jwkCache.until) return jwkCache.keys;
  const res = await fetch(JWK_URL);
  if (!res.ok) throw new Error('jwk');
  const maxAge = Number((/max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '') || [])[1]) || 3600;
  const { keys } = await res.json();
  jwkCache = { keys, until: Date.now() + maxAge * 1000 };
  return keys;
}
async function verifyFirebaseToken(token, projectId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('shape');
  const header = b64urlJson(parts[0]), payload = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('alg');
  const jwk = (await googleKeys()).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('signature');
  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== projectId || payload.iss !== 'https://securetoken.google.com/' + projectId) throw new Error('audience');
  if (!(payload.exp > now - 60) || !(payload.iat <= now + 60) || !payload.sub) throw new Error('time');
  return payload.sub;
}
