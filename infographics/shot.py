"""인포그래픽 HTML → PNG (헤드리스 크롬으로 길게 찍은 뒤 아래쪽 남는 부분을 잘라낸다).

사용법:  python infographics/shot.py infographics/R2.0.html [infographics/R2.0-2.html …]   (여러 장 · 와일드카드도 된다)
"""
import glob
import os
import re
import subprocess
import sys

from PIL import Image

CHROME = os.environ.get('CHROME') or (r'C:\Program Files\Google\Chrome\Application\chrome.exe' if os.name == 'nt' else '/opt/pw-browsers/chromium/chrome-linux/chrome')


def shot(src):
    src = os.path.abspath(src)
    png = os.path.splitext(src)[0] + '.png'
    url = 'file:///' + src.replace('\\', '/')
    text = open(src, encoding='utf-8').read()
    m = re.search(r'name="info-width" content="(\d+)"', text)
    width = m.group(1) if m else '1080'  # make.py 의 width
    mh = re.search(r'name="info-height" content="(\d+)"', text)  # 2026-11-24 덱 레이아웃: 높이가 정해진 장 (4:5) 은 그대로 찍고 자르지 않는다
    subprocess.run([CHROME, "--no-sandbox", '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=' + width + ',' + (mh.group(1) if mh else '5000'), '--virtual-time-budget=8000', '--screenshot=' + png, url], capture_output=True)
    im = Image.open(png).convert('RGB')
    if mh:
        im.save(png); print(png, *im.size); return
    w, h = im.size
    px = im.load()
    bg = px[w - 1, h - 1]
    bottom = h
    for y in range(h - 1, 0, -1):
        if any(px[x, y] != bg for x in range(0, w, 3)):
            bottom = min(h, y + 1 + 52)  # R2.13: 아래 여백을 남긴다 (꼬리말이 없어졌다)
            break
    im.crop((0, 0, w, bottom)).save(png)
    print(png, w, bottom)


def main():
    for a in sys.argv[1:]:
        for src in sorted(glob.glob(a)) or [a]:
            shot(src)


if __name__ == '__main__':
    main()
