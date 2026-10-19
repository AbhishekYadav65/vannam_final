#!/usr/bin/env python3
"""Builds every product image used by the site from the original photos.

For each product it writes (into public/img) and records in products.json:
  tile   4:5  pastel studio tile (white studio background replaced by the product's pastel; used for the story, bag, chips)
  rest   1:1  the "outside" photo shown at rest (lifestyle photo with the baked-in script text removed by inpainting)
  peek   1:1  the "inside" pastel studio shot revealed under the cursor
  gallery     rest + peek + the remaining original photos, for the product page slider

Usage:  python3 scripts/make-images.py <folder-with-original-images> <products.json>
Needs:  pip install pillow numpy scipy opencv-python-headless
"""
import json, os, sys
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, JSON = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'public', 'img')
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):                       # start clean so nothing stale ships
    if f.startswith('p') and f.endswith('.webp'): os.remove(os.path.join(OUT, f))

PASTEL = {'blush': '#f8d3dc', 'lilac': '#dcd2f4', 'butter': '#f9ebbb', 'mint': '#cfeadd', 'sky': '#d3e4f5', 'peach': '#fadccb'}
TINT = {1: 'lilac', 2: 'butter', 3: 'blush', 4: 'peach', 5: 'mint', 6: 'sky', 7: 'butter', 8: 'lilac', 9: 'sky', 10: 'blush', 11: 'lilac', 12: 'mint'}
# does the studio shot show the inside of the pouch? (otherwise the peek is just "another look")
INSIDE = {1, 2, 3, 5, 6, 7, 10, 12}

# areas of the lifestyle photo that hold baked-in script text, as fractions: (x0, y0, x1, y1, median window)
TEXT = {
    1: [(0.36, 0.08, 0.99, 0.34, 41)], 3: [(0.10, 0.06, 0.82, 0.36, 41)], 5: [(0.40, 0.08, 0.99, 0.36, 71)],
    7: [(0.42, 0.04, 0.99, 0.36, 81)], 8: [(0.28, 0.12, 0.95, 0.36, 41)], 9: [(0.0, 0.0, 1.0, 0.50, 91), (0.0, 0.36, 0.26, 0.56, 41)],
    10: [(0.36, 0.10, 0.99, 0.41, 51)], 11: [(0.03, 0.10, 0.82, 0.40, 61)], 12: [(0.36, 0.04, 0.99, 0.36, 51)],
}
WHITE_BG = {9}                                   # white backgrounds: paint white, never inpaint near the product


def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255


def pastel_studio(path, tint_hex, cw, ch, box_w, box_h, cy):
    im = Image.open(path).convert('RGB')
    im.thumbnail((int(cw * box_w), int(ch * box_h)), Image.LANCZOS)
    canvas = Image.new('RGB', (cw, ch), (255, 255, 255))
    canvas.paste(im, ((cw - im.width) // 2, int(ch * cy - im.height / 2)))
    a = np.asarray(canvas).astype(np.float32)
    mn, mx = a.min(2), a.max(2)
    lab, _ = ndi.label(mn >= 250)
    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    bg = np.isin(lab, list(edge))
    dist = ndi.distance_transform_edt(~bg)
    shadow = (dist <= 70) & ((mx - mn) <= 14) & (mn < 250) & (mn > 90)
    halo = (dist <= 3) & (mn >= 200)
    w = ndi.gaussian_filter((bg | shadow | halo).astype(np.float32), 1.0)[..., None]
    out = a * (1 - w) + a * hexrgb(tint_hex) * w
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def remove_text(path, pid):
    img = cv2.imread(path); H, W = img.shape[:2]
    boxes = TEXT.get(pid, [])
    if not boxes: return img
    mask = np.zeros((H, W), np.uint8)
    for x0, y0, x1, y1, k in boxes:
        X0, Y0, X1, Y1 = int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)
        roi = img[Y0:Y1, X0:X1]
        if pid in WHITE_BG:
            mask[Y0:Y1, X0:X1] = np.maximum(mask[Y0:Y1, X0:X1], ((roi.min(axis=2) < 246) * 255).astype(np.uint8))
        else:
            diff = cv2.absdiff(roi, cv2.medianBlur(roi, k | 1)).max(axis=2)
            mask[Y0:Y1, X0:X1] = np.maximum(mask[Y0:Y1, X0:X1], ((diff > 11) * 255).astype(np.uint8))
    if pid in WHITE_BG:                           # keep the product out of the mask
        n, lab, stats, _ = cv2.connectedComponentsWithStats((img.min(axis=2) < 225).astype(np.uint8), connectivity=8)
        pouch = cv2.dilate((lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        mask[pouch > 0] = 0
        out = img.copy(); out[mask > 0] = 255
        return out
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    return cv2.inpaint(img, mask, 8, cv2.INPAINT_TELEA)


def save_sizes(im, base, widths, ratio=None, q=80):
    for w in widths:
        h = round(w * (ratio if ratio else im.height / im.width))
        im.resize((w, h), Image.LANCZOS).save(f'{OUT}/{base}-{w}.webp', quality=q, method=6)


def entry(base, widths, w, h, alt, **extra):
    return {'sm': f'img/{base}-{widths[0]}.webp', 'md': f'img/{base}-{widths[1]}.webp', 'ws': list(widths), 'w': w, 'h': h, 'alt': alt, **extra}


data = json.load(open(JSON))
for p in data['products']:
    pid = p['id']; tint = PASTEL[TINT[pid]]; p['tint'] = tint
    name = p['name']
    files = [os.path.join(SRC, os.path.basename(i['file'])) for i in p['images']]
    kinds = [i['kind'] for i in p['images']]

    # tile 4:5
    save_sizes(pastel_studio(files[0], tint, 1000, 1250, .84, .74, .53), f'p{pid}-tile', (480, 800), ratio=1.25, q=82)
    # peek 1:1 (inside)
    save_sizes(pastel_studio(files[0], tint, 1000, 1000, .78, .78, .52), f'p{pid}-peek', (480, 800), ratio=1.0, q=82)
    # rest 1:1 (outside, text removed)
    clean = remove_text(files[1], pid)
    H, W = clean.shape[:2]
    if H > W: clean = clean[H - W:H, 0:W]          # portrait photo: keep the bottom square (the product), drop the empty top
    rest = Image.fromarray(cv2.cvtColor(clean, cv2.COLOR_BGR2RGB))
    save_sizes(rest, f'p{pid}-rest', (480, 800), ratio=1.0, q=82)

    gallery = [entry(f'p{pid}-rest', (480, 800), 800, 800, f'{name}, outside', fit='cover'),
               entry(f'p{pid}-peek', (480, 800), 800, 800, f'{name}, inside' if pid in INSIDE else f'{name}, another look', fit='cover')]
    for i in range(2, len(files)):                 # remaining originals (details, 360 views, styled shots)
        o = Image.open(files[i]).convert('RGB'); ratio = o.height / o.width
        save_sizes(o, f'p{pid}-x{i}', (640, 1100), q=80)
        label = 'details and 360 views' if kinds[i] == 'infographic' else 'styled shot'
        gallery.append(entry(f'p{pid}-x{i}', (640, 1100), 1100, round(1100 * ratio), f'{name}, {label}', fit='contain'))

    p['tile'] = entry(f'p{pid}-tile', (480, 800), 800, 1000, f'{name}')
    p['rest'] = entry(f'p{pid}-rest', (480, 800), 800, 800, f'{name}, outside')
    p['peek'] = entry(f'p{pid}-peek', (480, 800), 800, 800, f'{name}, inside' if pid in INSIDE else f'{name}, another look')
    p['peekLabel'] = 'Peek inside' if pid in INSIDE else 'Another look'
    p['gallery'] = gallery
    p.pop('images', None)

json.dump(data, open(os.path.join(ROOT, 'src', 'data', 'products.json'), 'w'), ensure_ascii=False, indent=1)
print('done:', len(data['products']), 'products;', len(os.listdir(OUT)), 'files in public/img')
