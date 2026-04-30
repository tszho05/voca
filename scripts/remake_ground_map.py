from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "public" / "assets" / "map"
MAP_LAYERS = ROOT / "src" / "data" / "mapLayers.ts"
RAW_BASE = MAP_DIR / "_raw" / "vocab-world-base-raw.png"

WIDTH = 2400
HEIGHT = 1500


def restore_original_base() -> Image.Image:
    if not RAW_BASE.exists():
        raise FileNotFoundError(f"Missing original map source: {RAW_BASE}")

    raw = Image.open(RAW_BASE).convert("RGBA")
    source_w, source_h = raw.size
    scale = max(WIDTH / source_w, HEIGHT / source_h)
    resized_w = round(source_w * scale)
    resized_h = round(source_h * scale)
    resized = raw.resize((resized_w, resized_h), Image.Resampling.LANCZOS)

    left = max(0, (resized_w - WIDTH) // 2)
    top = max(0, (resized_h - HEIGHT) // 2)
    restored = resized.crop((left, top, left + WIDTH, top + HEIGHT))
    if restored.size != (WIDTH, HEIGHT):
        canvas = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
        canvas.alpha_composite(restored, ((WIDTH - restored.width) // 2, (HEIGHT - restored.height) // 2))
        restored = canvas
    return restored


def parse_props() -> list[dict[str, object]]:
    text = MAP_LAYERS.read_text(encoding="utf-8")
    asset_matches = re.findall(r"\{ key: '([^']+)', path: '([^']+)' \}", text)
    assets = {key: ROOT / "public" / path for key, path in asset_matches if key.startswith("map-prop-")}

    props: list[dict[str, object]] = []
    for match in re.finditer(
        r"\{ id: '([^']+)', imageKey: '([^']+)', x: ([0-9]+), y: ([0-9]+), w: ([0-9]+), h: ([0-9]+), sortY: ([0-9]+) \}",
        text,
    ):
        prop_id, image_key, x, y, w, h, sort_y = match.groups()
        props.append({
            "id": prop_id,
            "image_key": image_key,
            "path": assets[image_key],
            "x": int(x),
            "y": int(y),
            "w": int(w),
            "h": int(h),
            "sort_y": int(sort_y),
        })
    return sorted(props, key=lambda item: int(item["sort_y"]))


def make_preview(base: Image.Image, props: list[dict[str, object]]) -> Image.Image:
    preview = base.copy()
    for prop in props:
        path = Path(prop["path"])
        image = Image.open(path).convert("RGBA")
        image = image.resize((int(prop["w"]), int(prop["h"])), Image.Resampling.LANCZOS)
        left = int(prop["x"]) - int(prop["w"]) // 2
        top = int(prop["y"]) - int(prop["h"])
        preview.alpha_composite(image, (left, top))
    return preview


def write_notes(base: Image.Image, props: list[dict[str, object]]) -> None:
    source = Image.open(RAW_BASE)
    note = """Restored original high-detail RPG ground background for chinese-vocab-rpg.

Intent:
- Restore the first preserved map source from public/assets/map/_raw/vocab-world-base-raw.png.
- Preserve the game's 2400x1500 MAP_SIZE, existing prop placement, blockers, player, vocabulary spirit, and boss coordinates.
- Keep the map ground/background-only; existing props remain separate layered assets.
- This is a restoration pass, not a new generated art direction.

Implementation:
- scripts/remake_ground_map.py resizes the preserved raw source to 2400x1500 using high-quality Lanczos resampling.
- vocab-world-preview.png is rebuilt by compositing the unchanged MAP_PROPS over the restored base.
- MAP_SIZE, MAP_BASE, MAP_PROPS, and MAP_BLOCKERS are intentionally unchanged.
"""
    (MAP_DIR / "vocab-world-base.prompt.txt").write_text(note, encoding="utf-8")
    (MAP_DIR / "vocab-world-preview-meta.json").write_text(
        json.dumps(
            {
                "source": str(RAW_BASE.relative_to(ROOT)).replace("\\", "/"),
                "source_size": {"width": source.width, "height": source.height},
                "output_size": {"width": base.width, "height": base.height},
                "resampling": "Lanczos cover resize centered to 2400x1500",
                "props_composited": [prop["id"] for prop in props],
                "strategy": "restore original high-detail ground-only base plus existing props preview",
                "interfaces_changed": False,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )


def validate(path: Path) -> None:
    image = Image.open(path)
    if image.size != (WIDTH, HEIGHT):
        raise RuntimeError(f"{path} has size {image.size}, expected {(WIDTH, HEIGHT)}")


def main() -> None:
    base = restore_original_base()
    props = parse_props()
    preview = make_preview(base, props)

    MAP_DIR.mkdir(parents=True, exist_ok=True)
    base.save(MAP_DIR / "vocab-world-base.png", optimize=True)
    preview.save(MAP_DIR / "vocab-world-preview.png", optimize=True)
    write_notes(base, props)

    validate(MAP_DIR / "vocab-world-base.png")
    validate(MAP_DIR / "vocab-world-preview.png")
    print(f"Restored {MAP_DIR / 'vocab-world-base.png'} from {RAW_BASE}")
    print(f"Rebuilt {MAP_DIR / 'vocab-world-preview.png'}")
    print(f"Composited {len(props)} props")


if __name__ == "__main__":
    main()
