# Mekanism 1.21.1-10.7.19.85 — fission reactor, industrial turbine, thermoelectric boiler

Source: github.com/mekanism/Mekanism tag `v1.21.1-10.7.19.85` (commit a00109e4856fd38b9c5b3dd7f22ce4a59cd65a80), MIT.
Runnable reference model: `mekanism-10.7.19.85-reference-model.js`; worked examples: `...-examples.json`.
The planner (`site/tools/mekanism/fission-reactor-calculator/`) reproduces those examples exactly.

## Fission (FissionReactorMultiblockData)
- 3–18 per side (exterior). Columns: contiguous fuel assemblies + 1 control rod on top.
- `SA = 6N − 2·(face-adjacent assembly pairs)`, `eff = min(1, SA/N/surfaceAreaTarget)`.
- `C = casingHeatCapacity × shellBlocks`; `k = eff × (water 0.5 | sodium 1)`; ambient = 300 + 25·(biomeTemp − 0.8).
- Steady T = (burn·energyPerFissionFuel + C·(k·373.15 + amb/20010)) / (C·(k + 1/20010)).
- Steam (water) = k·(T−373.15)·C·0.2/maxEnergyPerSteam ≈ heat/50. Sodium → hot sodium = heat/5, boiled back at /50.
- Damage above 1200 K: += min(T,1800)/12000 per tick; heals below. Meltdown possible at 100% damage.
- Overflowed heated coolant is discarded but its heat still removed.

## Turbine (TurbineMultiblockData)
- Odd L,W 5–17, H up to 18; rotor ≤ 14, blades ≤ 2/rotor, width check (min(L,W)−3)/2 ≥ (rotor+2)/4, H ≥ rotor+4.
- `J/mB = maxEnergyPerSteam/28 × min(blades, coils × bladesPerCoil)`.
- `maxFlow = min(L·W·rotor × dispersers × disperserChemicalFlow, vents × ventChemicalFlow)`, dispersers = (L−2)(W−2)−1.
- Steam tank `L·W·rotor × chemicalPerTank`; flow scales with fill → sustained input ≤ min(maxFlow, tank).

## Pack config (default / ATM10 / ATM10: Aeronautics)
energyPerFissionFuel 1,000,000 / 250,000 / 8,000 · bladesPerCoil 4/8/8 · ventChemicalFlow 32,000/43,478.262/43,478.262 ·
chemicalPerTank 64,000/6,400/6,400 · condenserRate 64,000/128,000/128,000 · boiler water/steam per tank doubled in both packs.

## Not yet verified in-game
Planner matches the source model; no in-game reactor reading compared yet.
