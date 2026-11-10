# 지후 시그니처 색 뽑기 (R2.28) — 초상화(PORTRAITS)에서 그 지후를 그린 잉크 색을 뽑아 index.html 의 SIG_C 한 줄을 다시 쓴다
#
#   python tools/sig-color.py              → SIG_C 갱신 (index.html · 줄바꿈 그대로)
#   python tools/sig-color.py --sheet a.png → 확인표 (초상화 · 뽑은 색 · 예전 CHARS.color) 도 만든다 — 눈으로 꼭 확인
#   python tools/sig-color.py --dry         → 쓰지 않고 출력만
#
# 방법: 흰 바탕 위 잉크(흰색에서 조금이라도 먼 픽셀 · 연한 색연필도) → 채도 있는 픽셀만 색상환 72칸 (채도 가중 · 이웃 칸 합쳐 부드럽게)
#       → 가장 큰 색 덩어리 ±14° 안에서 채도 × 명도가 높은 상위 35% 픽셀 평균 (테두리 흐림 · 흰 바탕 섞임을 뺀다)
#       → 색 있는 잉크가 전체 잉크의 22% 아래면 무채색 (검정 · 회색 지후) → 회색
#       → 어두운 UI 위에서 보이게 밝기만 0.40 ~ 0.70 사이로 (색상 · 채도는 그대로)
#       → 두 번째로 큰 색 덩어리가 45° 넘게 다르고 충분히 크면 '#색1,#색2' (게임에서 135° 그라데이션 · sigBg · 여러 색도 된다: 조커는 무지개)
# 어긋나면 아래 SIG_FIX 에 손으로 적는다 (새 지후도 마찬가지 · 확인표를 보고)
import re, base64, io, colorsys, json, sys

SIG_FIX = {  # id: '#rrggbb' — 자동으로 뽑은 색이 그 지후의 색과 다를 때만
    'mercury': '#aab2c0',  # 은색 몸 + 빨간 뿔 → 자동은 빨강
    'antigrav': '#b48cff',  # 회색 몸 + 연보라 구슬 → 자동은 회색
    'joker': '#ff4d4d,#ffa63d,#ffe14d,#4ad66b,#4da6ff,#a46bff',  # 예외: 무지개 그라데이션 (사용자 요청)
    'cake': '#e6010f,#ff8ccf', 'cakeslice': '#e6010f,#ff8ccf',  # 빨간 모자 + 분홍 크림 (색상이 가까워 자동으로는 한 색)
    'engineer': '#ca1e02,#3aa0ff',  # 갈색 + 파란 고글
    'rot': '#9b3fc7', 'pkskul': '#ff7a00',  # R2.30 부패: 보라 (자동은 자홍) · 폭발 스껄: 호박 주황 (자동은 회색)
}

HTML = 'index.html'
def load():
    src = open(HTML, 'rb').read().decode('utf-8')
    a = src.index('const PORTRAITS = {'); b = src.index('\n};', a)
    P = dict(re.findall(r"^\s+(\w+): 'data:image/\w+;base64,([^']+)'", src[a:b], re.M))
    chars = []
    for m in re.finditer(r"^  (\w+): \{ name: '([^']+)', rarity: '(\w+)'([^\n]*)", src, re.M):
        cid, name, rar, rest = m.groups()
        pk = re.search(r"portrait: PORTRAITS\.(\w+)", rest); col = re.search(r"color: '(#[0-9a-fA-F]{3,6})'", rest)
        chars.append((cid, name, pk.group(1) if pk else cid, col.group(1) if col else None))
    return src, P, chars

def sig(b64):
    from PIL import Image
    im = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    im = bg.convert('RGB').resize((128, 128), Image.LANCZOS)
    px = list(im.getdata() if not hasattr(im, 'get_flattened_data') else im.get_flattened_data())
    ink_w = 0.0; col = []  # (hue, s, v, rgb, weight)
    for r, g, b in px:
        mn, mx = min(r, g, b), max(r, g, b)
        if 255 - mn < 40: continue  # 흰 바탕
        ink_w += 255 - mn
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if mx - mn >= 45 and s >= 0.30: col.append((h, s, v, (r, g, b), mx - mn))
    cw = sum(c[4] for c in col)
    if not col or cw < ink_w * 0.22:  # 무채색 지후
        dark = [p for p in px if 255 - min(p) >= 40]
        L = sum(sum(p) / 3 for p in dark) / max(1, len(dark)) / 255
        return [colorsys.hls_to_rgb(0.62, min(max(L, 0.48), 0.62), 0.06)], True
    N = 72; hist = [0.0] * N
    for h, s_, v, _, w in col: hist[int(h * N) % N] += w
    sm = [sum(hist[(i + k) % N] for k in (-2, -1, 0, 1, 2)) for i in range(N)]
    def cluster(peak):  # 그 색상 ±14° 안에서 채도 × 명도 상위 35% 평균
        mem = [c for c in col if min(abs(c[0] - peak), 1 - abs(c[0] - peak)) <= 14 / 360]
        mem.sort(key=lambda c: c[1] * c[2], reverse=True); top = mem[:max(8, int(len(mem) * 0.35))]
        r, g, b = [sum(c[3][i] for c in top) / len(top) / 255 for i in range(3)]
        h, l, s2 = colorsys.rgb_to_hls(r, g, b)
        return colorsys.hls_to_rgb(h, min(max(l, 0.40), 0.70), s2)
    p1 = max(range(N), key=lambda i: sm[i]); out = [cluster((p1 + 0.5) / N)]
    # 두 번째 색: 첫 색에서 45° 넘게 떨어진 가장 큰 덩어리가 첫 덩어리의 38% 이상이고 색 잉크의 18% 이상이면 그라데이션
    far = [i for i in range(N) if min(abs(i - p1), N - abs(i - p1)) * 360 / N > 45]
    if far:
        p2 = max(far, key=lambda i: sm[i])
        if sm[p2] >= sm[p1] * 0.38 and sm[p2] >= sum(hist) * 0.18: out.append(cluster((p2 + 0.5) / N))
    return out, False

def hexc(rgb): return '#%02x%02x%02x' % tuple(round(max(0, min(1, x)) * 255) for x in rgb)

def main():
    src, P, chars = load(); out = {}; gray = []
    for cid, name, pk, _ in chars:
        if pk not in P: print('초상화 없음', cid); continue
        c, g = sig(P[pk]); out[cid] = SIG_FIX.get(cid) or ','.join(hexc(x) for x in c)
        if g: gray.append(cid)
    print(f'{len(out)}종 · 무채색 {len(gray)}: {" ".join(gray)}')
    if '--sheet' in sys.argv: sheet(sys.argv[sys.argv.index('--sheet') + 1], P, chars, out)
    if '--dry' in sys.argv: print(json.dumps(out)); return
    line = 'const SIG_C = ' + json.dumps(out, separators=(',', ':')) + '; /* R2.28 지후 시그니처 색 — tools/sig-color.py 가 초상화에서 뽑아 쓴다 (손으로 고칠 땐 그 파일의 SIG_FIX) */'
    raw = open(HTML, 'rb').read()
    m = re.search(rb'^const SIG_C = .*$', raw, re.M)
    if not m: print('index.html 에 const SIG_C 줄이 없어요'); sys.exit(1)
    end = m.end() - (1 if raw[m.end() - 1:m.end()] == b'\r' else 0)
    raw = raw[:m.start()] + line.encode('utf-8') + raw[end:]
    open(HTML, 'wb').write(raw); print('SIG_C 갱신')

def sheet(path, P, chars, out):
    from PIL import Image, ImageDraw, ImageFont
    cols, cw, chh = 10, 120, 150; rows = (len(chars) + cols - 1) // cols
    img = Image.new('RGB', (cols * cw, rows * chh), '#1f2748'); d = ImageDraw.Draw(img)
    try: f = ImageFont.truetype('malgun.ttf', 13)
    except Exception: f = ImageFont.load_default()
    for i, (cid, name, pk, old) in enumerate(chars):
        if cid not in out: continue
        x, y = (i % cols) * cw, (i // cols) * chh
        cs = out[cid].split(',')
        if len(cs) == 1: d.rounded_rectangle([x + 8, y + 6, x + cw - 8, y + cw - 18], 14, fill=cs[0])
        else:
            g = Image.new('RGB', (cw - 16, cw - 24)); gd = ImageDraw.Draw(g); C = [[int(c[k:k + 2], 16) for k in (1, 3, 5)] for c in cs]; T = g.size[0] + g.size[1]
            for t in range(T):
                f2 = t / T * (len(C) - 1); j = min(int(f2), len(C) - 2); u = f2 - j
                gd.line([(t, 0), (0, t)], fill=tuple(round(C[j][k] + (C[j + 1][k] - C[j][k]) * u) for k in range(3)), width=2)
            m2 = Image.new('L', g.size, 0); ImageDraw.Draw(m2).rounded_rectangle([0, 0, g.size[0] - 1, g.size[1] - 1], 14, fill=255); img.paste(g, (x + 8, y + 6), m2)
        im = Image.open(io.BytesIO(base64.b64decode(P[pk]))).convert('RGB').resize((cw - 32, cw - 32))
        img.paste(im, (x + 16, y + 14))
        if old: d.rectangle([x + cw - 30, y + cw - 14, x + cw - 10, y + cw - 2], fill=old)  # 예전 CHARS.color
        d.text((x + 10, y + cw - 14), name.replace(' 지후', ''), fill='#ffffff', font=f)
        d.text((x + 10, y + cw + 2), ('무지개 ' + str(len(cs)) + '색' if len(cs) > 2 else out[cid].replace(',', ' ')) + (' *' if cid in SIG_FIX else ''), fill='#c9d0e6', font=f)
    img.save(path); print('확인표', path)

if __name__ == '__main__': main()
