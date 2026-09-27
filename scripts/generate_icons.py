import os
from PIL import Image, ImageDraw

def generate_all_icons():
    src_path = 'icon/CH.jpg'
    if not os.path.exists(src_path):
        raise FileNotFoundError(f"Source icon not found at {src_path}")

    src = Image.open(src_path).convert('RGBA')
    W, H = src.size
    cx, cy = W // 2, H // 2
    r = 565 # radius of the circular emblem

    # Crop tight square around the circular emblem
    box = (cx - r, cy - r, cx + r, cy + r)
    cropped = src.crop(box) # (1130, 1130)
    crop_w, crop_h = cropped.size

    # Create antialiased circular mask
    mask_scale = 4
    large_size = (crop_w * mask_scale, crop_h * mask_scale)
    mask = Image.new('L', large_size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, large_size[0], large_size[1]), fill=255)
    smooth_mask = mask.resize((crop_w, crop_h), Image.Resampling.LANCZOS)

    # Circular emblem with transparent background
    emblem_transparent = cropped.copy()
    emblem_transparent.putalpha(smooth_mask)

    # 1. Generate Web / PWA icons in public/
    os.makedirs('public', exist_ok=True)
    emblem_transparent.resize((512, 512), Image.Resampling.LANCZOS).save('public/icon-512.png', format='PNG')
    emblem_transparent.resize((192, 192), Image.Resampling.LANCZOS).save('public/icon-192.png', format='PNG')
    emblem_transparent.resize((64, 64), Image.Resampling.LANCZOS).save('public/favicon.png', format='PNG')
    emblem_transparent.resize((32, 32), Image.Resampling.LANCZOS).save('public/favicon-32.png', format='PNG')
    print("Generated Web/PWA icons in public/")

    # 2. Android Mipmap densities
    # (density_name, icon_size, foreground_canvas_size, foreground_emblem_size)
    mipmap_specs = [
        ('mipmap-mdpi', 48, 108, 76),
        ('mipmap-hdpi', 72, 162, 114),
        ('mipmap-xhdpi', 96, 216, 152),
        ('mipmap-xxhdpi', 144, 324, 228),
        ('mipmap-xxxhdpi', 192, 432, 304),
    ]

    res_base = 'android/app/src/main/res'
    for folder, icon_sz, fg_canvas_sz, fg_emb_sz in mipmap_specs:
        folder_path = os.path.join(res_base, folder)
        os.makedirs(folder_path, exist_ok=True)

        # A) Round launcher icon (ic_launcher_round.png)
        round_icon = emblem_transparent.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        round_icon.save(os.path.join(folder_path, 'ic_launcher_round.png'), format='PNG')

        # B) Standard launcher icon (ic_launcher.png) - round icon with clean border
        round_icon.save(os.path.join(folder_path, 'ic_launcher.png'), format='PNG')

        # C) Adaptive foreground icon (ic_launcher_foreground.png)
        # 108dp canvas with centered emblem (~70% of canvas)
        fg_canvas = Image.new('RGBA', (fg_canvas_sz, fg_canvas_sz), (0, 0, 0, 0))
        fg_emblem = emblem_transparent.resize((fg_emb_sz, fg_emb_sz), Image.Resampling.LANCZOS)
        offset = (fg_canvas_sz - fg_emb_sz) // 2
        fg_canvas.paste(fg_emblem, (offset, offset), fg_emblem)
        fg_canvas.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), format='PNG')

        print(f"Generated icons for {folder}: {icon_sz}x{icon_sz} (fg: {fg_canvas_sz}x{fg_canvas_sz})")

    # 3. Android Splash Screens
    # Splash screens should be centered on a dark theme background (#020617)
    splash_dirs = [
        ('drawable', (480, 800)),
        ('drawable-port-hdpi', (480, 800)),
        ('drawable-port-mdpi', (320, 480)),
        ('drawable-port-xhdpi', (720, 1280)),
        ('drawable-port-xxhdpi', (960, 1600)),
        ('drawable-port-xxxhdpi', (1280, 1920)),
        ('drawable-land-hdpi', (800, 480)),
        ('drawable-land-mdpi', (480, 320)),
        ('drawable-land-xhdpi', (1280, 720)),
        ('drawable-land-xxhdpi', (1600, 960)),
        ('drawable-land-xxxhdpi', (1920, 1280)),
    ]

    bg_color = (2, 6, 23, 255) # #020617

    for folder, (sw, sh) in splash_dirs:
        folder_path = os.path.join(res_base, folder)
        if os.path.exists(folder_path):
            splash = Image.new('RGBA', (sw, sh), bg_color)
            # Emblem size: min(sw, sh) * 0.45
            emb_sz = int(min(sw, sh) * 0.45)
            resized_emb = emblem_transparent.resize((emb_sz, emb_sz), Image.Resampling.LANCZOS)
            pos_x = (sw - emb_sz) // 2
            pos_y = (sh - emb_sz) // 2
            splash.paste(resized_emb, (pos_x, pos_y), resized_emb)
            splash.convert('RGB').save(os.path.join(folder_path, 'splash.png'), format='PNG')
            print(f"Generated splash for {folder}: {sw}x{sh}")

    print("All Android and Web icons successfully generated!")

if __name__ == '__main__':
    generate_all_icons()
