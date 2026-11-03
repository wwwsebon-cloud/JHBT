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
    m = re.search(r'name="info-width" content="(\d+)"', open(src, encoding='utf-8').read())
    width = m.group(1) if m else '1080'  # make.py 의 width
    subprocess.run([CHROME, "--no-sandbox", '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=' + width + ',5000', '--virtual-time-budget=8000', '--screenshot=' + png, url], capture_output=True)
    im = Image.open(png).convert('RGB')
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
