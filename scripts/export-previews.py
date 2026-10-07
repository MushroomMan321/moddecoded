"""Export each calculator's default 3D build for the spinning previews on the front page.

Opens every calculator in headless Chrome, grabs the three.js scene it renders, and writes a compact
model (textures, materials, geometry parameters, block transforms) to site/img/tools/3d/<name>.json.
site/index.html loads these and renders them in the tool cards.

Run it again whenever a calculator's default build or its block textures change:

    python scripts/export-previews.py            # all tools
    python scripts/export-previews.py turbine    # just one

Needs Python Playwright (pip install playwright) and Google Chrome.
"""
import functools
import http.server
import json
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
OUT = SITE / "img" / "tools" / "3d"

TOOLS = {
    "turbine": "/tools/extreme-reactors/turbine-calculator/",
    "reactor": "/tools/extreme-reactors/reactor-calculator/",
    "fission": "/tools/mekanism/fission-reactor-calculator/",
    # air-cooled, so the card shows the reactor and its lasers rather than a turbine three times its size
    "fusion": "/tools/mekanism/fusion-reactor-calculator/#d=mdz1.a.98.5.17.17.18.14.28.4.345.0",
    "tank": "/tools/mekanism/dynamic-tank-calculator/",
    "airship": "/tools/create-aeronautics/airship-calculator/",
    "cpu": "/tools/applied-energistics-2/crafting-cpu-calculator/",
    "station": "/tools/ryzer-gen/fission-station-calculator/",
}

# The calculators keep three.js inside an IIFE, so catch the scene and camera when the render loop
# updates their matrices (r128's WebGLRenderer.render is a per-instance function, so it can't be hooked).
HOOK = """() => {
  const up = THREE.Object3D.prototype.updateMatrixWorld;
  THREE.Scene.prototype.updateMatrixWorld = function (f) { window.__scene = this; return up.call(this, f); };
  const cup = THREE.PerspectiveCamera.prototype.updateMatrixWorld;
  THREE.PerspectiveCamera.prototype.updateMatrixWorld = function (f) { window.__camera = this; return cup.call(this, f); };
}"""

# Runs in the page. Two samples 250 ms apart find groups that animate (the turbine rotor) so the
# preview can spin them too. Matrices are stored relative to the scene, rounded to 3 places.
EXPORT = """
async () => {
  const S = window.__scene, cam = window.__camera;
  const r3 = v => Math.round(v * 1000) / 1000;
  const snap = () => { const m = new Map(); S.traverse(o => m.set(o, { q: o.quaternion.clone(), p: o.position.clone() })); return m; };
  S.updateMatrixWorld(true);
  const a = snap(); await new Promise(r => setTimeout(r, 250)); const b = snap();
  const spins = new Map();   // Object3D -> { axis, rate rad/s }
  for (const [o, s0] of a) { const s1 = b.get(o); if (!s1 || o === S || o.isCamera) continue;
    const d = s0.q.clone().invert().multiply(s1.q); const ang = 2 * Math.acos(Math.min(1, Math.abs(d.w)));
    if (ang > 1e-4 && s0.p.distanceTo(s1.p) < 1e-6 && o.children.length) {
      const k = Math.sin(ang / 2) * Math.sign(d.w || 1);
      spins.set(o, { axis: [d.x / k, d.y / k, d.z / k].map(r3), rate: r3(ang / 0.25) }); } }
  S.updateMatrixWorld(true);

  const tex = [], texIdx = new Map(), mats = [], matIdx = new Map(), geos = [], geoIdx = new Map(), parts = [], groups = [];
  const texOf = t => { if (!t || !t.image) return -1; if (texIdx.has(t.image)) return texIdx.get(t.image);
    const img = t.image; let url;
    if (img.toDataURL) url = img.toDataURL(); else { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; c.getContext("2d").drawImage(img, 0, 0); url = c.toDataURL(); }
    texIdx.set(t.image, tex.length); tex.push(url); return tex.length - 1; };
  const matOf = m => { if (matIdx.has(m)) return matIdx.get(m);
    const o = { k: m.type === "MeshBasicMaterial" ? "b" : "l", t: texOf(m.map), c: m.color.getHex() };
    if (m.transparent) o.tr = 1; if (m.opacity < 1) o.op = r3(m.opacity); if (!m.depthWrite) o.dw = 0;
    if (m.side) o.sd = m.side; if (m.vertexColors) o.vc = 1; if (m.emissive && m.emissive.getHex()) o.em = m.emissive.getHex();
    if (m.alphaTest) o.at = m.alphaTest;
    matIdx.set(m, mats.length); mats.push(o); return mats.length - 1; };
  const geoOf = g => { if (geoIdx.has(g)) return geoIdx.get(g);
    let o; if (g.parameters && /^(Box|Cylinder|Cone|Plane|Sphere)Geometry$/.test(g.type)) o = { t: g.type.replace("Geometry", ""), p: Object.values(g.parameters).map(v => typeof v === "number" ? r3(v) : v) };
    else { o = { t: "Buf", a: {} };   // flat-shaded meshes (no index) get their normals back from computeVertexNormals
      for (const k of ["position", "normal", "uv", "color"]) if (g.attributes[k] && !(k === "normal" && !g.index)) o.a[k] = [...g.attributes[k].array].map(r3);
      if (g.index) o.i = [...g.index.array]; }
    geoIdx.set(g, geos.length); geos.push(o); return geos.length - 1; };
  const spinAncestor = o => { for (let p = o.parent; p; p = p.parent) if (spins.has(p)) return p; return null; };
  const grpOf = p => { if (!p) return -1; let i = groups.findIndex(gr => gr.o === p);
    if (i < 0) { p.updateMatrixWorld(true); groups.push({ o: p, m: p.matrixWorld.elements.map(r3), ...spins.get(p) }); i = groups.length - 1; } return i; };
  const visible = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const rel = new THREE.Matrix4(), inv = new THREE.Matrix4(), tmp = new THREE.Matrix4(), col = new THREE.Color();
  const isT = e => Math.abs(e[0]-1)+Math.abs(e[5]-1)+Math.abs(e[10]-1)+Math.abs(e[1])+Math.abs(e[2])+Math.abs(e[4])+Math.abs(e[6])+Math.abs(e[8])+Math.abs(e[9]) < 1e-6;
  S.traverse(o => {
    // meshes added straight to the scene are scenery (the airship's sea and clouds), and ones drawn
    // without a depth test are annotations (its force arrows); neither is part of the build
    if (!o.isMesh || o.parent === S || !visible(o) || Array.isArray(o.material) || !o.material.depthTest) return;
    const sp = spinAncestor(o), gi = grpOf(sp);
    if (sp) rel.copy(inv.copy(sp.matrixWorld).invert()).multiply(o.matrixWorld); else rel.copy(o.matrixWorld);
    const key = o.geometry.uuid + "|" + o.material.uuid + "|" + gi + "|" + (o.renderOrder || 0);
    let part = parts.find(p => p.key === key);
    if (!part) { part = { key, g: geoOf(o.geometry), m: matOf(o.material), grp: gi, ro: o.renderOrder || 0, p: [], x: [], c: [] }; parts.push(part); }
    const n = o.isInstancedMesh ? o.count : 1;
    for (let i = 0; i < n; i++) {
      if (o.isInstancedMesh) { o.getMatrixAt(i, tmp); tmp.premultiply(rel); } else tmp.copy(rel);
      const e = tmp.elements;
      if (e[0] === 0 && e[5] === 0 && e[10] === 0) continue;   // hidden instance (scaled to 0)
      if (isT(e)) part.p.push(r3(e[12]), r3(e[13]), r3(e[14]));
      else part.x.push(...[0,1,2,4,5,6,8,9,10,12,13,14].map(j => r3(e[j])));
      if (o.isInstancedMesh && o.instanceColor) { o.getColorAt(i, col); part.c.push(col.getHex()); }
    }
  });
  const out = parts.filter(p => p.p.length || p.x.length).map(({ key, ...p }) => {
    if (!p.x.length) delete p.x; if (!p.p.length) delete p.p; if (!p.c.length) delete p.c;
    if (p.grp < 0) delete p.grp; if (!p.ro) delete p.ro; return p; });
  cam.updateMatrixWorld(true);
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir);
  return { v: 1, tex, mats, geos, parts: out, groups: groups.map(({ o, ...g }) => g),
           cam: { fov: cam.fov, pos: cam.position.toArray().map(r3), dir: dir.toArray().map(r3) } };
}
"""


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(SITE))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main(names):
    OUT.mkdir(parents=True, exist_ok=True)
    httpd = serve()
    base = f"http://127.0.0.1:{httpd.server_address[1]}"
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for name in names:
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(base + TOOLS[name])
            page.evaluate(HOOK)
            page.wait_for_function("window.__scene && window.__camera", timeout=20000)
            page.wait_for_timeout(3500)   # let the build-in animation finish
            model = page.evaluate(EXPORT)
            path = OUT / f"{name}.json"
            path.write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")
            n = sum(len(pt.get("p", [])) // 3 + len(pt.get("x", [])) // 12 for pt in model["parts"])
            print(f"{name}: {n} blocks, {len(model['tex'])} textures, {path.stat().st_size // 1024} KB")
            page.close()
        browser.close()
    httpd.shutdown()


if __name__ == "__main__":
    args = sys.argv[1:] or list(TOOLS)
    bad = [a for a in args if a not in TOOLS]
    if bad:
        sys.exit(f"unknown tool(s): {', '.join(bad)}; choose from {', '.join(TOOLS)}")
    main(args)
