"""Render Mekanism machine blocks into face strips for the ore processing calculator's 3D view.

Each machine's block model (its running state: the blockstate's facing=north, active=true variant where there is one)
is read from the Mekanism jar (parents, composite children and texture variables resolved) and
every element is projected onto the six sides of the block, back to front, with its real UVs. That gives a true picture of
each side even for the machines that aren't plain cubes (crystallizer, washer, separator...), drawn on a box.

Output: site/img/mekanism/blocks/<name>.png, 192×32: front, back, left, right, top, bottom of a machine facing south
(the way the calculator places them: left is west, right is east), 32 px per side.

    python scripts/mek-block-tiles.py [path/to/Mekanism.jar]     # default: the update check's cached jar

Needs Pillow. Mekanism's code and assets are MIT licensed; the notice is in site/img/mekanism/LICENSE.txt.
"""
import io
import json
import pathlib
import sys
import zipfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
JAR = ROOT / "updates" / ".cache" / "Mekanism-1.21.1-10.7.19.85.jar"
OUT = ROOT / "site" / "img" / "mekanism" / "blocks"
T = 32   # pixels per side in the output

MACHINES = ["enrichment_chamber", "crusher", "energized_smelter", "purification_chamber", "chemical_injection_chamber",
            "chemical_dissolution_chamber", "chemical_washer", "chemical_crystallizer", "electrolytic_separator",
            "chemical_infuser", "chemical_oxidizer", "rotary_condensentrator"]
FACTORIES = [(tier, kind) for kind in ("enriching", "crushing", "smelting", "purifying", "injecting")
             for tier in ("basic", "advanced", "elite", "ultimate")]
# vanilla parents these models use: only cube_all carries geometry
VANILLA = {
    "block/block": {"textures": {}},
    "block/cube": {"elements": [{"from": [0, 0, 0], "to": [16, 16, 16], "faces": {d: {"texture": "#" + d, "cullface": d}
                   for d in ("down", "up", "north", "south", "west", "east")}}]},
    "block/cube_all": {"parent": "block/cube", "textures": {d: "#all" for d in ("down", "up", "north", "south", "west", "east")}},
}


class Jar:
    def __init__(self, path):
        self.z = zipfile.ZipFile(path)
        self.tex = {}

    def model(self, ref):
        ref = ref.replace("minecraft:", "")
        if ref in VANILLA:
            return VANILLA[ref]
        ns, path = ref.split(":", 1)
        return json.loads(self.z.read(f"assets/{ns}/models/{path}.json"))

    def block_model(self, block):
        """The model a block shows facing north, running if the block has an active state."""
        variants = json.loads(self.z.read(f"assets/mekanism/blockstates/{block}.json"))["variants"]
        keys = [k for k in variants if "facing=north" in k.split(",")]
        key = next((k for k in keys if "active=true" in k.split(",")), keys[0])
        v = variants[key]
        return (v[0] if isinstance(v, list) else v)["model"]

    def texture(self, ref):
        if ref not in self.tex:
            ns, path = ref.split(":", 1) if ":" in ref else ("minecraft", ref)
            im = Image.open(io.BytesIO(self.z.read(f"assets/{ns}/textures/{path}.png"))).convert("RGBA")
            meta = f"assets/{ns}/textures/{path}.png.mcmeta"
            if meta in self.z.namelist() and im.height > im.width:   # animated strip: first frame
                im = im.crop((0, 0, im.width, im.width))
            self.tex[ref] = im
        return self.tex[ref]


def resolve(jar, ref, inherited=None):
    """[(element, texture map)] for a model: textures merge down the parent chain, elements come from the nearest
    model that has them, and composite children are resolved as models of their own."""
    chain, m = [], jar.model(ref) if isinstance(ref, str) else ref
    while True:
        chain.append(m)
        if "parent" not in m:
            break
        m = jar.model(m["parent"])
    textures = {}
    for m in reversed(chain):
        textures.update(m.get("textures", {}))
    if inherited:
        textures = {**inherited, **textures}
    out = []
    for m in chain:
        if m.get("children"):
            for child in m["children"].values():
                out += resolve(jar, child, textures)
            return out
        if m.get("elements"):
            return [(e, textures) for e in m["elements"]]
    return out


def lookup(textures, ref, depth=0):
    while ref.startswith("#") and depth < 10:
        ref = textures.get(ref[1:], ""); depth += 1
    return ref or None


def auto_uv(face, f, t):
    x0, y0, z0 = f; x1, y1, z1 = t
    return {"north": [16 - x1, 16 - y1, 16 - x0, 16 - y0], "south": [x0, 16 - y1, x1, 16 - y0],
            "east": [16 - z1, 16 - y1, 16 - z0, 16 - y0], "west": [z0, 16 - y1, z1, 16 - y0],
            "up": [x0, z0, x1, z1], "down": [x0, 16 - z1, x1, 16 - z0]}[face]


# where an element's face lands on the side image (model space, block facing north), and its depth from that side
def rect(face, f, t):
    x0, y0, z0 = f; x1, y1, z1 = t
    return {"north": (16 - x1, 16 - y1, 16 - x0, 16 - y0, z0), "south": (x0, 16 - y1, x1, 16 - y0, 16 - z1),
            "east": (16 - z1, 16 - y1, 16 - z0, 16 - y0, 16 - x1), "west": (z0, 16 - y1, z1, 16 - y0, x0),
            "up": (x0, z0, x1, z1, 16 - y1), "down": (x0, 16 - z1, x1, 16 - z0, y0)}[face]


def side(jar, parts, face):
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0)); k = T / 16
    draws = []
    for e, textures in parts:
        fc = e.get("faces", {}).get(face)
        if not fc:
            continue
        ref = lookup(textures, fc["texture"])
        if not ref:
            continue
        x0, y0, x1, y1, depth = rect(face, e["from"], e["to"])
        if x1 - x0 < 0.01 or y1 - y0 < 0.01:
            continue
        draws.append((depth, x0, y0, x1, y1, ref, fc.get("uv") or auto_uv(face, e["from"], e["to"]), fc.get("rotation", 0)))
    for depth, x0, y0, x1, y1, ref, uv, rot in sorted(draws, key=lambda d: -d[0]):   # farthest first
        tex = jar.texture(ref); s = tex.width / 16
        u0, v0, u1, v1 = uv
        box = (round(min(u0, u1) * s), round(min(v0, v1) * s), max(round(min(u0, u1) * s) + 1, round(max(u0, u1) * s)),
               max(round(min(v0, v1) * s) + 1, round(max(v0, v1) * s)))
        crop = tex.crop(box)
        if u0 > u1:
            crop = crop.transpose(Image.FLIP_LEFT_RIGHT)
        if v0 > v1:
            crop = crop.transpose(Image.FLIP_TOP_BOTTOM)
        if rot:
            crop = crop.rotate(-rot, expand=True)
        w, h = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
        crop = crop.resize((w, h), Image.NEAREST)
        img.alpha_composite(crop, (round(x0 * k), round(y0 * k)))
    return img


def strip(jar, ref):
    parts = resolve(jar, ref)
    # the calculator's machines face south (the model turned 180°): front = model north, left (west) = model east,
    # right (east) = model west, and the top and bottom turn half a circle
    faces = [side(jar, parts, "north"), side(jar, parts, "south"), side(jar, parts, "east"), side(jar, parts, "west"),
             side(jar, parts, "up").rotate(180), side(jar, parts, "down").rotate(180)]
    out = Image.new("RGBA", (T * 6, T), (0, 0, 0, 0))
    for i, f in enumerate(faces):
        out.alpha_composite(f, (i * T, 0))
    return out


def main(path):
    jar = Jar(path); OUT.mkdir(parents=True, exist_ok=True)
    jobs = MACHINES + [f"{t}_{k}_factory" for t, k in FACTORIES]
    for name in jobs:
        ref = jar.block_model(name)
        im = strip(jar, ref)
        im.save(OUT / f"{name}.png", optimize=True)
        print(f"{name}: {ref}, {(OUT / f'{name}.png').stat().st_size} bytes")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else JAR)
