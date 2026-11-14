# 인스타그램용 인포그래픽 조각 (post-patch.js 가 부른다) — python tools/ig-slices.py <출력 폴더> <png …>
# 인스타그램 게시물은 JPEG 만 · 세로 4:5 (0.8) ~ 가로 1.91:1 비율만 받는다 → 긴 그림은 4:5 조각으로 자르고 (마지막 조각은 바탕색으로 채움) · 넓은 그림은 위아래를 채운다
# 출력: <이름>-ig<N>.jpg (폭 1080) 경로를 한 줄에 하나씩 (캐러셀 최대 10장)
import sys, os
from PIL import Image

W = 1080
def bg_of(im):  # 바탕색 = 왼쪽 아래 구석 픽셀
    return im.getpixel((2, im.height - 3))

def pad(im, w, h, bg):
    c = Image.new('RGB', (w, h), bg)
    c.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    return c

def slices(path):
    im = Image.open(path).convert('RGB'); bg = bg_of(im); w, h = im.size; r = w / h; out = []
    if r < 0.8:  # 길쭉함 → 4:5 조각 (타일을 가로지르지 않게 바탕만 있는 빈 줄에서 자른다)
        sh = round(w / 0.8); y = 0
        def blank(row):
            ex = im.crop((0, row, w, row + 1)).getextrema()
            return all(abs(lo - c) <= 14 and abs(hi - c) <= 14 for (lo, hi), c in zip(ex, bg))
        while h - y > sh:
            t = y + sh; cut = next((c for c in range(t, int(y + sh * 0.45), -1) if blank(c)), t)
            out.append(pad(im.crop((0, y, w, cut)), w, sh, bg)); y = cut
        out.append(pad(im.crop((0, y, w, h)), w, sh, bg))
    elif r > 1.91:  # 너무 넓음 → 위아래 채우기
        out.append(pad(im, w, round(w / 1.91), bg))
    else:
        out.append(im)
    return [p.resize((W, round(p.height * W / p.width)), Image.LANCZOS) for p in out]

if __name__ == '__main__':
    od = sys.argv[1]; os.makedirs(od, exist_ok=True); n = 0
    for src in sys.argv[2:]:
        stem = os.path.splitext(os.path.basename(src))[0]
        for i, p in enumerate(slices(src), 1):
            if n >= 10: break
            f = os.path.join(od, f'{stem}-ig{i}.jpg'); p.save(f, 'JPEG', quality=90); print(f); n += 1
