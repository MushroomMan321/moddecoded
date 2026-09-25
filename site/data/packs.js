// Modpack config presets shared by the calculators.
//
// To add a pack, copy an entry and fill it in from the pack's own config files. Only list keys
// whose value differs from the mod's default; anything left out uses the default. Keys are written
// "section.key", exactly as they appear in the .toml file:
//   extremereactors -> config/extremereactors/common.toml
//   mekanism        -> config/Mekanism/generators.toml (general.* and boiler.* keys: config/Mekanism/general.toml)
// The keys each calculator reads are listed in its "Edit values" panel and in CONTRIBUTING.md.
//
//   id      URL-safe slug. It is also the deep link: /tools/.../turbine-calculator/#<id>
//   source  Where the values came from: a public repo at a commit, or the pack's release version.
//   mods    One entry per supported mod. Leave a mod out if the pack does not ship it.
//           {absent: true, note} lists the pack greyed out (for example "no Mekanism yet").
//           note is a short label shown under the pack name.
window.MD_PACKS = [
  {
    id: "atm10", name: "ATM10", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/ATM-10", commit: "e5e3d1d", checked: "2026-09-25" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "fission_reactor.energyPerFissionFuel": 250000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400 } },
    },
  },
  {
    // Validated in-game 2026-09-25: turbine RPM and power matched the calculator exactly.
    id: "atm10-aeronautics", name: "ATM10: Aeronautics", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/ATM-10-a", commit: "d876358", checked: "2026-09-25" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 0.5, "general.fuelUsageMultiplier": 1.2,
        "reactor.reactorPowerProductionMultiplier": 0.8, "reactor.maxReactorHeight": 32,
        "turbine.turbinePowerProductionMultiplier": 0.8, "turbine.maxTurbineSize": 16, "turbine.maxTurbineHeight": 16 } },
      mekanism: { config: {
        "fission_reactor.energyPerFissionFuel": 8000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400 } },
    },
  },
  {
    id: "atm10-sky", name: "ATM10 To The Sky", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/All-the-mods-10-Sky", commit: "53b95da", checked: "2026-09-25" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "fission_reactor.energyPerFissionFuel": 2800000, "fission_reactor.casingHeatCapacity": 4000,
        "fission_reactor.surfaceAreaTarget": 1.8, "turbine.ventChemicalFlow": 43478.262, "turbine.condenserRate": 128000 } },
    },
  },
  {
    id: "all-the-mons", name: "All the Mons", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/All-the-Mons", commit: "56b5a4a", checked: "2026-09-25" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "fission_reactor.energyPerFissionFuel": 250000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400 } },
    },
  },
  {
    id: "atm10-lite", name: "ATM10 Lite", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/ATM-10-L", commit: "6186086", checked: "2026-09-25" },
    mods: {
      mekanism: { config: {}, note: "mod defaults" },
    },
  },
  {
    id: "atm9", name: "ATM9", mc: "1.20.1",
    source: { repo: "https://github.com/AllTheMods/ATM-9", commit: "255ca23", checked: "2026-09-25" },
    mods: {
      extremereactors: { note: "older ER version", config: {
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {}, note: "defaults · older Mekanism" },
    },
  },
  {
    id: "atm9-sky", name: "ATM9 To The Sky", mc: "1.20.1",
    source: { repo: "https://github.com/AllTheMods/All-the-mods-9-Sky", commit: "3363206", checked: "2026-09-25" },
    mods: {
      mekanism: { config: {}, note: "defaults · older Mekanism" },
    },
  },
  {
    id: "atm8", name: "ATM8", mc: "1.19.2",
    source: { repo: "https://github.com/AllTheMods/ATM-8", commit: "eda4ddf", checked: "2026-09-25" },
    mods: {
      mekanism: { config: {}, note: "defaults · older Mekanism" },
    },
  },
  {
    id: "atm11", name: "ATM11", mc: "26.1",
    source: { repo: "https://github.com/AllTheMods/ATM-11", checked: "2026-09-25" },
    mods: {
      extremereactors: { absent: true, note: "no Extreme Reactors yet" },
      mekanism: { absent: true, note: "no Mekanism yet" },
    },
  },
];

// ---- helper used by the calculators (contributors don't need to touch this) ----
// fields: the calculator's CFG_FIELDS, [internalName, "section.key", ...].
// Returns presets keyed by pack id (plus "default") and the rows for the modpack picker.
window.mdPackPresets = function (mod, defaults, fields) {
  const presets = { default: { ...defaults } }, list = [];
  for (const p of window.MD_PACKS) {
    const m = p.mods[mod];
    if (!m) continue;
    const note = [p.mc, m.note].filter(Boolean).join(" · ");
    if (m.absent) { list.push([p.id, p.name, note, true]); continue; }
    const cfg = { ...defaults };
    for (const [name, key] of fields) if (m.config && key in m.config) cfg[name] = m.config[key];
    presets[p.id] = cfg;
    list.push([p.id, p.name, note]);
  }
  return { presets, list };
};
// Preset keys saved in visitors' browsers before the ids became URL slugs.
window.mdPackPresets.legacy = { aero: "atm10-aeronautics", atm10sky: "atm10-sky", atmons: "all-the-mons", atm10lite: "atm10-lite", atm9sky: "atm9-sky" };
