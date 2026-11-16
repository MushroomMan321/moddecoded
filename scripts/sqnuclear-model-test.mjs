// Replays the research model's table (sqnuclear-research/notes/scripts/reactor_model.py, its printed output) through
// the calculator's model, site/tools/sq-nuclear/reactor-calculator/reactor-model.js. Every row must match.
//   node scripts/sqnuclear-model-test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const src = readFileSync(fileURLToPath(new URL("../site/tools/sq-nuclear/reactor-calculator/reactor-model.js", import.meta.url)), "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src, ctx);
const { SQN } = ctx;

// [case, kwargs, want, flow, heat gen, cooling, safe, wet, dry, turbine cap, FE/t, rod life (min)]
const ROWS = [
  ["9 T1 rods, full, no parts, dryer", {}, 640, 640, 0.7, 0.84, true, 320, 312, 400, 79872, 48.0],
  ["same, separator only", { dryer: "separator" }, 640, 640, 0.7, 0.84, true, 320, 288, 400, 73728, 48.0],
  ["same, separator then dryer (compendium chain)", { dryer: "both" }, 640, 640, 0.7, 0.84, true, 320, 281, 400, 71885, 48.0],
  ["+ reheater", { reheat: true }, 640, 640, 0.7, 0.84, true, 320, 250, 400, 95846, 48.0],
  ["+ reheater + feedwater heater", { reheat: true, preheat: true }, 640, 640, 0.7, 0.84, true, 368, 287, 400, 110223, 48.0],
  ["+ reheater + preheat + glowstone translator", { reheat: true, preheat: true, translator: 4 }, 640, 640, 0.7, 0.84, true, 368, 287, 1200, 165335, 48.0],
  ["T1 + coal moderator", { mod: 1 }, 800, 800, 0.84, 1.0, true, 400, 390, 400, 99840, 38.4],
  ["T1 + obsidian, no cooler", { mod: 3 }, 1280, 1280, 1.54, 1.48, false, 640, 624, 400, 102400, 24.0],
  ["T1 + obsidian + heat exchanger", { mod: 3, cooler: 1 }, 1280, 1280, 1.54, 1.78, true, 640, 624, 400, 102400, 24.0],
  ["T1 + fluorite + heat exchanger", { mod: 4, cooler: 1 }, 1920, 1920, 2.52, 2.42, false, 960, 936, 400, 102400, 16.0],
  ["T1 + fluorite + active cooler", { mod: 4, cooler: 2 }, 1920, 1920, 2.52, 2.72, true, 960, 936, 400, 102400, 16.0],
  ["T1 + heavy water, no cooler", { mod: 5 }, 2560, 2560, 2.94, 2.76, false, 1280, 1248, 400, 102400, 12.0],
  ["T1 + heavy water + heat exchanger, 1 SG", { mod: 5, cooler: 1 }, 2560, 2560, 2.94, 3.06, true, 1280, 1248, 400, 102400, 12.0],
  ["T2 rods full, 1 SG", { tier: 2 }, 2400, 2400, 0.7, 0.84, true, 1200, 1170, 400, 102400, 48.0],
  ["T2 rods full, 2 SG", { tier: 2, sg: 2 }, 2400, 2400, 0.7, 0.84, true, 1200, 1170, 400, 102400, 48.0],
  ["T4 rods full (want 8000), 2 SG", { tier: 4, sg: 2 }, 8000, 5120, 1.276, 0.61, false, 2560, 2496, 400, 102400, 48.0],
  ["T4 rods level 9, 2 SG", { tier: 4, rod_level: 9, sg: 2 }, 4800, 4800, 0.7, 0.84, true, 2400, 2340, 400, 102400, 80.0],
  ["T4 level 9, 2 SG, dryer+reheat, 2 turbines glowstone", { tier: 4, rod_level: 9, sg: 2, reheat: true, turbines: 2, translator: 4 }, 4800, 4800, 0.7, 0.84, true, 2400, 1872, 2400, 1078272, 80.0],
  ["T4 level 9, 2 SG, dryer+reheat, 1 turbine glowstone", { tier: 4, rod_level: 9, sg: 2, reheat: true, turbines: 1, translator: 4 }, 4800, 4800, 0.7, 0.84, true, 2400, 1872, 1200, 691200, 80.0],
];
const KEYS = ["want", "flow", "heat_gen", "cooling", "safe", "wet", "steam", "turbine_cap", "fe_t", "rod_life_min"];

let bad = 0;
for (const [name, kw, ...want] of ROWS) {
  const { row } = SQN.researchRun(kw);
  const diffs = KEYS.filter((k, i) => row[k] !== want[i]).map(k => `${k} ${row[k]} != ${want[KEYS.indexOf(k)]}`);
  if (diffs.length) bad++;
  console.log(`${diffs.length ? "FAIL" : "ok  "} ${name}${diffs.length ? ": " + diffs.join(", ") : ""}`);
}

// Checks of the parts the research table doesn't cover
const check = (label, got, exp, tol = 1e-6) => { const ok = Math.abs(got - exp) <= tol; if (!ok) bad++; console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${got}${ok ? "" : " expected " + exp}`); };
const base = SQN.researchRun({}).d;
// a full T1 core lasts 48 min and averages half its fresh output (output follows the charge left)
const L = SQN.life(base);
check("T1 core life (min)", L.ticks / 1200, 48, 0.01);
check("T1 life-average / fresh", L.avg / L.fresh.fe, 0.5, 0.01);
// T4 full on 2 SG: the vessel moves 5,120 of 8,000 wanted, so the rods burn at 64 % speed (vessel(): done = n / whole)
const t4 = SQN.researchRun({ tier: 4, sg: 2 }).s;
check("T4 full burn rate (done)", t4.done, 0.64, 1e-9);
// xenon: one filter holds a full-power uranium core at 20 %, MOX needs 2; no filter stops it in ~15 min
const xu = SQN.xenon(1, 0, 1, 0), xm = SQN.xenon(1, 1, 0, 0), x0 = SQN.xenon(1, 0, 0, 0);
check("xenon filters, uranium", SQN.xenon(1, 0, 0, 0).need, 1);
check("xenon filters, MOX", xm.need, 2);
check("xenon with 1 filter settles at (%)", xu.eq, 20, 0.05);
check("xenon stops a full core after (min)", x0.stopTicks / 1200, 14.93, 0.05);
// hydrogen: 0 recombiners -> 100 % in 5,000 ticks; 2 needed at full power
check("hydrogen, no recombiner (ticks)", SQN.hydrogen(1, 0).toFull, 5000, 1e-6);
check("recombiners needed at full power", SQN.hydrogen(1, 0).need, 2);
// meltdown time for the obsidian row: (1.54 - 1.48) x 0.8 = 0.048/t -> 20,833 ticks + 250
const ob = SQN.researchRun({ mod: 3 }).s;
check("obsidian, no cooler: ticks to explosion", ob.toBoom, 1000 / (0.06 * 0.8) + 250, 0.5);
// boron 500 ppm: power x0.75
check("boron 500 ppm power factor", SQN.chemFactor({ boron: 500, xenon: 0 }), 0.75);
check("xenon 100 % power factor", SQN.chemFactor({ boron: 0, xenon: 100 }), 0);
check("xenon 65 % power factor", SQN.chemFactor({ boron: 0, xenon: 65 }), 0.8);

console.log(bad ? `${bad} failed` : "all passed");
process.exit(bad ? 1 : 0);
