// Modpack config presets shared by the calculators.
//
// To add a pack, copy an entry and fill it in from the pack's own config files. Only list keys
// whose value differs from the mod's default; anything left out uses the default. Keys are written
// "section.key", exactly as they appear in the .toml file:
//   extremereactors -> config/extremereactors/common.toml
//   mekanism        -> config/Mekanism/generators.toml (general.*, boiler.*, dynamic_tank.* and digital_miner.* keys: config/Mekanism/general.toml;
//                      usage.* keys: config/Mekanism/machine-usage.toml;
//                      kubejs.atmOreProcessing: 1 when the pack ships ATM's kubejs/server_scripts/mods/Mekanism/ore_processing.js)
//   ryzergen        -> config/ryzergen-common.toml
//   advanced_ae     -> config/advanced_ae-common.toml (its section is "quantum computer", with the space)
//   colossal_reactors -> config/colossal_reactors-common.toml (keys keep their numbered prefix: "reactor.size.000_maxReactorWidth");
//                      keys without one are datapack values from data/colossal_reactors/recipe/reactor|turbine/*.json
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
    source: { repo: "https://github.com/AllTheMods/ATM-10", commit: "d12e72c", checked: "2026-10-19" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "general.maxUpgradeMultiplier": 16, "kubejs.atmOreProcessing": 1,
        "fission_reactor.energyPerFissionFuel": 250000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400,
        "fusion_reactor.thermocoupleEfficiency": 0.04, "fusion_reactor.casingThermalConductivity": 0.333333333,
        "fusion_reactor.waterHeatingRatio": 0.27272727272727, "fusion_reactor.fuelCapacity": 500 } },
      advanced_ae: { config: {
        "quantum computer.quantumComputerAcceleratorThreads": 12, "quantum computer.quantumComputerMultiThreaderMultiplication": 6,
        "quantum computer.quantumComputerDataEntanglerMultiplication": 6 } },
    },
  },
  {
    // Validated in-game 2026-09-25: turbine RPM and power matched the calculator exactly.
    id: "atm10-aeronautics", name: "ATM10: Aeronautics", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/ATM-10-a", commit: "913c86d", checked: "2026-10-19" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 0.5, "general.fuelUsageMultiplier": 1.2,
        "reactor.reactorPowerProductionMultiplier": 0.8, "reactor.maxReactorHeight": 32,
        "turbine.turbinePowerProductionMultiplier": 0.8, "turbine.maxTurbineSize": 16, "turbine.maxTurbineHeight": 16 } },
      mekanism: { config: {
        "general.maxUpgradeMultiplier": 16, "kubejs.atmOreProcessing": 1,
        "fission_reactor.energyPerFissionFuel": 8000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400,
        "fusion_reactor.fuelEnergy": 100000, "fusion_reactor.thermocoupleEfficiency": 0.02,
        "fusion_reactor.casingThermalConductivity": 0.333333333, "fusion_reactor.waterHeatingRatio": 0.27272727272727, "fusion_reactor.fuelCapacity": 500 } },
      advanced_ae: { config: {
        "quantum computer.quantumComputerAcceleratorThreads": 12, "quantum computer.quantumComputerMultiThreaderMultiplication": 6,
        "quantum computer.quantumComputerDataEntanglerMultiplication": 6 } },
    },
  },
  {
    id: "atm10-sky", name: "ATM10 To The Sky", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/All-the-mods-10-Sky", commit: "c186b04", checked: "2026-10-19" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "general.maxUpgradeMultiplier": 16, "usage.enrichmentChamber": 100, "usage.crusher": 100, "usage.energizedSmelter": 100,
        "usage.purificationChamber": 400, "usage.chemicalInjectionChamber": 800, "usage.chemicalDissolutionChamber": 800,
        "usage.chemicalWasher": 400, "usage.chemicalCrystallizer": 800, "usage.chemicalInfuser": 400, "usage.chemicalOxidizer": 400,
        "usage.rotaryCondensentrator": 100,
        "fission_reactor.energyPerFissionFuel": 2800000, "fission_reactor.casingHeatCapacity": 4000,
        "fission_reactor.surfaceAreaTarget": 1.8, "turbine.ventChemicalFlow": 43478.262, "turbine.condenserRate": 128000,
        "fusion_reactor.thermocoupleEfficiency": 0.04, "fusion_reactor.casingThermalConductivity": 0.333333333,
        "fusion_reactor.waterHeatingRatio": 0.27272727272727, "fusion_reactor.fuelCapacity": 500 } },
    },
  },
  {
    id: "all-the-mons", name: "All the Mons", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/All-the-Mons", commit: "140143f", checked: "2026-10-19" },
    mods: {
      extremereactors: { config: {
        "general.powerProductionMultiplier": 4.0, "general.fuelUsageMultiplier": 0.8,
        "reactor.reactorPowerProductionMultiplier": 3.0, "turbine.turbinePowerProductionMultiplier": 3.0 } },
      mekanism: { config: {
        "general.maxUpgradeMultiplier": 16, "kubejs.atmOreProcessing": 1,
        "fission_reactor.energyPerFissionFuel": 250000, "turbine.bladesPerCoil": 8, "turbine.ventChemicalFlow": 43478.262,
        "turbine.condenserRate": 128000, "turbine.chemicalPerTank": 6400,
        "fusion_reactor.thermocoupleEfficiency": 0.04, "fusion_reactor.casingThermalConductivity": 0.333333333,
        "fusion_reactor.waterHeatingRatio": 0.27272727272727, "fusion_reactor.fuelCapacity": 500 } },
      advanced_ae: { config: {
        "quantum computer.quantumComputerAcceleratorThreads": 12, "quantum computer.quantumComputerMultiThreaderMultiplication": 6,
        "quantum computer.quantumComputerDataEntanglerMultiplication": 6 } },
    },
  },
  {
    id: "atm10-lite", name: "ATM10 Lite", mc: "1.21.1",
    source: { repo: "https://github.com/AllTheMods/ATM-10-L", commit: "6186086", checked: "2026-09-25" },
    mods: {
      mekanism: { config: { "kubejs.atmOreProcessing": 1 }, note: "mod defaults" },
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
  // HBM's Nuclear Tech Mod (id hbm) has no reactor config files; these keys are reactor constants read
  // out of each fork's code (see research/ntm-1.0.27-reactors.md). The original NTM is the "Mod defaults" row.
  {
    id: "ntmspace", name: "NTM:Space", mc: "1.7.10",
    source: { repo: "https://github.com/JameH2/Hbm-s-Nuclear-Tech-GIT", commit: "xspace57b", checked: "2026-10-09" },
    mods: { hbm: { config: { "zirnox.steamFactor": 187.5, "rbmk.rodHullLimit": 1500 }, note: "X5778_H261" } },
  },
  {
    id: "ntm-ce", name: "NTM: Community Edition", mc: "1.12.2",
    source: { repo: "https://github.com/Warfactory-Official/Hbm-s-Nuclear-Tech-CE", checked: "2026-10-09" },
    mods: { hbm: { config: { "zirnox.steamFactor": 187.5, "rbmk.rodHullLimit": 1500, "rbmk.dial.reasimCount": 6, "rbmk.dial.reasimMod": 1.0 }, note: "2.6.1.0" } },
  },
  {
    id: "ntm-reforged", name: "NTM Reforged", mc: "1.12.2",
    source: { repo: "https://github.com/alexsander55455455-cmyk/HBM-NTM-Reforged", commit: "e48bb19", checked: "2026-10-09" },
    mods: { hbm: { config: { "rbmk.rodHullLimit": 1500, "rbmk.fuel.drx.yield": 1e8, "rbmk.fuel.hea242.meltingPoint": 3386,
      "rbmk.fuel.heaus.function": "SQUARE_ROOT", "rbmk.fuel.heaus.heat": 2.0 }, note: "1.0.7 · PWR plates" } },
  },
  {
    id: "ntm-fe", name: "NTM: Final Edition", mc: "1.12.2",
    source: { repo: "https://github.com/SeraphinaAstra/Hbm-Nuclear-Tech-FE", commit: "3ee5d85", checked: "2026-10-09" },
    mods: { hbm: { config: { "rbmk.rodHullLimit": 1500, "rbmk.fuel.drx.yield": 1e8, "rbmk.fuel.hea242.meltingPoint": 3386,
      "rbmk.fuel.heaus.function": "SQUARE_ROOT", "rbmk.fuel.heaus.heat": 2.0 }, note: "2.5.0.5-X001" } },
  },
  {
    // Craftoria 1.37.0 ships Mekanism 10.7.19 and no Extreme Reactors. Its advanced_ae-common.toml keeps the QC defaults.
    id: "craftoria", name: "Craftoria", mc: "1.21.1",
    source: { repo: "https://github.com/TeamAOF/Craftoria", commit: "5689ac1", checked: "2026-09-28" },
    mods: {
      mekanism: { config: { "fission_reactor.energyPerFissionFuel": 500000,
        "fusion_reactor.thermocoupleEfficiency": 0.04, "fusion_reactor.casingThermalConductivity": 0.25, "fusion_reactor.fuelCapacity": 500 } },
      advanced_ae: { config: {}, note: "mod defaults" },
    },
  },
  {
    // FTB pack with no public repo: values read from the 1.23.0 release files on the FTB API (pack 130, version 100554).
    // Ships Mekanism 10.7.19.85 and no Extreme Reactors; every key the calculators read is at its default.
    // It also ships Mekanism Unleashed 0.3.4, which lets machines take up to 32 speed/energy upgrades (Tweaks.maxUpgrades).
    // Its formulas match Mekanism's up to 8 upgrades, which is as far as the calculators go.
    id: "stoneblock4", name: "FTB StoneBlock 4", mc: "1.21.1",
    source: { repo: "https://www.feed-the-beast.com/modpacks/130-ftb-stoneblock-4", version: "1.23.0", checked: "2026-10-20" },
    mods: {
      mekanism: { config: {}, note: "mod defaults · up to 32 upgrades" },
    },
  },
  {
    // FTB Evolution 2 1.5.1 (FTB App pack 135, version 100577) ships Colossal Reactors 2.4.1.0.0, as 1.4.1 did (same files). Values from its
    // config/colossal_reactors-common.toml and datapacks/ftb/data/colossal_reactors/recipe/{reactor,turbine}/*.json, which
    // replace the jar's recipe files. The pack's own guide page still shows the 1.3.0 values (exponent 0.55, 0.8 steam per mB, 48 mB a blade).
    // Keys without a numbered prefix are datapack values (see the Colossal Reactors calculator's CFG_FIELDS); 1/0 = present or not.
    id: "ftb-evolution-2", name: "FTB Evolution 2", mc: "26.1.2",
    source: { repo: "https://www.feed-the-beast.com/modpacks/135-ftb-evolution-2", version: "1.5.1", checked: "2026-10-25" },
    mods: {
      colossal_reactors: { config: {
        "reactor.size.000_maxReactorWidth": 32, "reactor.size.001_maxReactorLength": 32, "reactor.size.002_maxReactorHeight": 32,
        "reactor.balance.001_rodEnergyScalingExponent": 0.76, "turbine.blade.004_steamMbPerBladePerTick": 150.0,
        "coolant.water.rf_to_coolant_factor": 0.085, "coolant.water.steam_per_coolant": 3.93, "turbine.water.rf_production": 9.0,
        "fuel.red_cake": 0, "heat_sink.industrial_coolant": 1, "heat_sink.ftb_armory": 1, "tag.peridot": 0,
        "turbine.size.000_maxTurbineWidth": 32, "turbine.size.001_maxTurbineLength": 32, "turbine.size.002_maxTurbineHeight": 32,
        "coil.ftb": 1,
        // the pack ships Colossal Reactors 2.4.1, which skips air when averaging the coil zone (fixed in 2.4.2)
        "turbine.coil.001_legacyIgnoreAirInCoilAverage": 1,
        // and the 2.4 rotor: one rod controller in the middle of the deck, and a rod counts every blade touching its run (2.5 changed both)
        "rotor.2_5": 0 } },
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
