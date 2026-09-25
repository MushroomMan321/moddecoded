// Reference model of Mekanism Generators 1.21.1-10.7.19.85 (tag v1.21.1-10.7.19.85, commit a00109e4856fd38b9c5b3dd7f22ce4a59cd65a80)
// Fission reactor, Industrial turbine, Thermoelectric boiler. Energy in Joules (J); FE = J / feConversionRate.

const CFG = {
  default: { energyPerFissionFuel: 1_000_000, casingHeatCapacity: 1000, surfaceAreaTarget: 4, burnPerAssembly: 1, maxFuelPerAssembly: 8000,
    cooledCoolantPerTank: 100_000, heatedCoolantPerTank: 1_000_000, bladesPerCoil: 4, ventChemicalFlow: 32_000, disperserChemicalFlow: 1280,
    condenserRate: 64_000, energyCapacityPerVolume: 16_000_000, chemicalPerTank: 64_000, maxEnergyPerSteam: 10, feConversionRate: 2.5,
    boilerWaterPerTank: 16_000, boilerSteamPerTank: 160_000, boilerHeatedCoolantPerTank: 256_000, boilerCooledCoolantPerTank: 256_000,
    boilerWaterConductivity: 0.7, superheatingHeatTransfer: 16_000_000 },
};
CFG.atm10 = { ...CFG.default, energyPerFissionFuel: 250_000, bladesPerCoil: 8, ventChemicalFlow: 43478.262, condenserRate: 128_000, chemicalPerTank: 6400,
  boilerWaterPerTank: 32_000, boilerSteamPerTank: 320_000, boilerHeatedCoolantPerTank: 512_000, boilerCooledCoolantPerTank: 512_000 };
CFG.aero = { ...CFG.atm10, energyPerFissionFuel: 8000 };

const BOIL_T = 273.15 + 100;         // HeatUtils.BASE_BOIL_TEMP
const STEAM_EFF = 0.2;               // HeatUtils.getSteamEnergyEfficiency
const WATER_COND = 0.5;              // FissionReactorMultiblockData.waterConductivity
const FIS_INV_ENV = 10_000 + 10_000 + 10; // AIR_INVERSE_COEFFICIENT + INVERSE_INSULATION + INVERSE_CONDUCTION
const BOIL_INV_ENV = 10_000 + 100_000 + 1;
const SODIUM = { cooledEnthalpy: 5, cooledConductivity: 1, hotEnthalpy: 5, hotConductivity: 0.4, hotTemperature: 100_000 };
const trunc = Math.trunc;
const ambientFromBiome = (bt) => 300 + 25 * (Math.min(5, Math.max(-5, bt)) - 0.8);

// ---------------- FISSION ----------------
// columns: array of {h} = fuel assembly blocks per column (each column topped by 1 control rod)
// adjacentPairs: number of face-adjacent fuel-assembly pairs (0 for checkerboard/isolated columns)
function fissionStructure(cfg, { L, W, H, columns, adjacentPairs = 0 }) {
  const N = columns.reduce((a, c) => a + c.h, 0);
  const surfaceArea = 6 * N - 2 * (adjacentPairs + columns.reduce((a, c) => a + (c.h - 1), 0));
  const shell = L * W * H - (L - 2) * (W - 2) * (H - 2);
  const volume = L * W * H;
  return {
    N, surfaceArea, shell, volume,
    eff: N === 0 ? 0 : Math.min(1, (surfaceArea / N) / cfg.surfaceAreaTarget),
    C: cfg.casingHeatCapacity * shell,
    maxBurn: N * cfg.burnPerAssembly,
    fuelCap: N * cfg.maxFuelPerAssembly, wasteCap: N * cfg.maxFuelPerAssembly,
    cooledCap: volume * cfg.cooledCoolantPerTank, heatedCap: volume * cfg.heatedCoolantPerTank,
  };
}

// continuous steady state (ignores the per-tick floor; error < 50/(k*C) K)
function fissionSteady(cfg, st, burn, coolant = 'water', amb = 300) {
  const P = burn * cfg.energyPerFissionFuel;
  const k = (coolant === 'water' ? WATER_COND : SODIUM.cooledConductivity) * st.eff;
  const T = (P + st.C * (k * BOIL_T + amb / FIS_INV_ENV)) / (st.C * (k + 1 / FIS_INV_ENV));
  const coolantHeat = k * (T - BOIL_T) * st.C;
  const heatedPerTick = coolant === 'water' ? coolantHeat * STEAM_EFF / cfg.maxEnergyPerSteam : coolantHeat / SODIUM.cooledEnthalpy;
  const maxSafeBurn = st.C * (k * (1200 - BOIL_T) + (1200 - amb) / FIS_INV_ENV) / cfg.energyPerFissionFuel;
  return { T, heatedPerTick, coolantInPerTick: heatedPerTick, maxSafeBurn: Math.min(maxSafeBurn, st.maxBurn), maxSafeBurnUncapped: maxSafeBurn };
}

// exact per-tick simulation (coolant/fuel tanks assumed topped up, outputs drained)
function fissionSim(cfg, st, burn, coolant = 'water', amb = 300, ticks = 400) {
  let H = st.C * amb, dmg = 0, last = null;
  for (let t = 0; t < ticks; t++) {
    let pending = 0;
    const toBurn = Math.min(burn, 1e18, st.maxBurn);          // burnFuel
    pending += toBurn * cfg.energyPerFissionFuel;
    const heat = st.eff * (H - BOIL_T * st.C);                 // handleCoolant (uses heat BEFORE this tick's burn is applied)
    let heated;
    if (coolant === 'water') {
      heated = Math.max(0, trunc(STEAM_EFF * (heat * WATER_COND) / cfg.maxEnergyPerSteam));
      pending -= heated * cfg.maxEnergyPerSteam / STEAM_EFF;
    } else {
      heated = Math.max(0, trunc(heat * SODIUM.cooledConductivity / SODIUM.cooledEnthalpy));
      pending -= heated * SODIUM.cooledEnthalpy;
    }
    const T = H / st.C;                                        // simulateEnvironment
    pending -= ((T - amb) / FIS_INV_ENV) * st.C;
    if (Math.abs(pending) > 1e-6) H += pending;                // updateHeatCapacitors
    const Tn = H / st.C;                                       // handleDamage
    if (Tn > 1200) dmg += Math.min(Tn, 1800) / 12000; else dmg = Math.max(0, dmg - (1200 - Tn) / 120000);
    last = { T: Tn, heated, dmg };
  }
  return last;
}

// ---------------- TURBINE ----------------
// L,W odd, 5..17; H 3..18; rotors = rotor blocks below complex; blades <= 2*rotors
function turbineStructure(cfg, { L, W, H, rotors, blades, coils, vents, condensers = 0 }) {
  const innerRadius = trunc((Math.min(L, W) - 3) / 2);
  const ok = L % 2 === 1 && W % 2 === 1 && innerRadius >= trunc((rotors + 2) / 4) && blades <= 2 * rotors && rotors + 4 <= H;
  const lowerVolume = L * W * rotors;
  const dispersers = (L - 2) * (W - 2) - 1;
  const mult = (cfg.maxEnergyPerSteam / 28) * Math.min(blades, coils * cfg.bladesPerCoil);
  const maxFlow = Math.min(lowerVolume * dispersers * cfg.disperserChemicalFlow, vents * cfg.ventChemicalFlow); // getMaxFlowRate (GUI)
  const steamCap = lowerVolume * cfg.chemicalPerTank;
  return { ok, lowerVolume, dispersers, mult, maxFlow, steamCap,
    maxSustainedFlow: Math.min(maxFlow, steamCap),   // flow = min(stored,maxFlow)*stored/cap <= min(maxFlow, cap)
    maxProductionJ: trunc(mult * maxFlow), energyCap: L * W * H * cfg.energyCapacityPerVolume, maxWater: condensers * cfg.condenserRate };
}
function turbineSteady(cfg, ts, steamIn) {
  const S = Math.min(steamIn, ts.maxSustainedFlow);
  const K = ts.steamCap, F = ts.maxFlow;
  const stored = (S * K / F >= F) ? S * K / F : Math.sqrt(S * K);
  return { flow: S, storedSteam: stored, J: trunc(ts.mult * S), FE: ts.mult * S / cfg.feConversionRate, excessSteam: steamIn - S };
}

// ---------------- BOILER ----------------
function boilerStructure(cfg, { L, W, H, disperserLayer /*0-based y from bottom casing*/, elements }) {
  const waterVolume = L * W * disperserLayer - elements;      // includes shell blocks below the disperser layer
  const steamVolume = L * W * (H - 1 - disperserLayer);
  const shell = L * W * H - (L - 2) * (W - 2) * (H - 2);
  return { waterVolume, steamVolume, C: 50 * shell,
    waterCap: waterVolume * cfg.boilerWaterPerTank, hotCoolantCap: waterVolume * cfg.boilerHeatedCoolantPerTank,
    steamCap: steamVolume * cfg.boilerSteamPerTank, cooledCoolantCap: steamVolume * cfg.boilerCooledCoolantPerTank,
    boilCapacity: trunc(cfg.superheatingHeatTransfer * elements / cfg.maxEnergyPerSteam * STEAM_EFF) };
}
function boilerSteady(cfg, bs, hotSodiumIn, amb = 300) {
  const heatIn = hotSodiumIn * SODIUM.hotEnthalpy;
  const steam = Math.min(heatIn * STEAM_EFF / cfg.maxEnergyPerSteam, bs.boilCapacity);
  const T = BOIL_T + (steam * cfg.maxEnergyPerSteam / STEAM_EFF) / (bs.C * cfg.boilerWaterConductivity);
  const storedHotNeeded = hotSodiumIn / (SODIUM.hotConductivity * (1 - T / SODIUM.hotTemperature));
  return { steam, T, storedHotNeeded, waterIn: steam };
}

module.exports = { CFG, fissionStructure, fissionSteady, fissionSim, turbineStructure, turbineSteady, boilerStructure, boilerSteady };

if (require.main === module) {
  const out = [];
  for (const pack of ['default', 'atm10', 'aero']) {
    const cfg = CFG[pack];
    // Reactor 7x7x7, 9 isolated columns of 4 fuel assemblies + 1 control rod
    const R = fissionStructure(cfg, { L: 7, W: 7, H: 7, columns: Array(9).fill({ h: 4 }) });
    const burn = R.maxBurn;
    const ssW = fissionSteady(cfg, R, burn, 'water'), simW = fissionSim(cfg, R, burn, 'water');
    const ssS = fissionSteady(cfg, R, burn, 'sodium'), simS = fissionSim(cfg, R, burn, 'sodium');
    // Turbine 17x17x18 max, 14 rotors, 28 blades, vents 345
    const T1 = turbineStructure(cfg, { L: 17, W: 17, H: 18, rotors: 14, blades: 28, coils: Math.ceil(28 / cfg.bladesPerCoil), vents: 15 * 15 + 4 * 15 * 2, condensers: 0 });
    // Turbine 7x7x10, 6 rotors, 12 blades, vents 65
    const T2 = turbineStructure(cfg, { L: 7, W: 7, H: 10, rotors: 6, blades: 12, coils: Math.ceil(12 / cfg.bladesPerCoil), vents: 25 + 4 * 5 * 2 });
    const B = boilerStructure(cfg, { L: 9, W: 9, H: 12, disperserLayer: 4, elements: 21 });
    out.push({ pack, reactor: R, burn, water: { ...ssW, sim: simW }, sodium: { ...ssS, sim: simS },
      T1, T1_run: turbineSteady(cfg, T1, ssW.heatedPerTick), T2, T2_run: turbineSteady(cfg, T2, ssW.heatedPerTick),
      boiler: B, boiler_run: boilerSteady(cfg, B, ssS.heatedPerTick) });
  }
  console.log(JSON.stringify(out, (k, v) => typeof v === 'number' ? +v.toFixed(4) : v, 1));
}
