# Contributing to Mod Decoded

Thanks for helping. Three kinds of contribution help most, in this order:

1. **In-game checks.** If you built something and the calculator was off (or exactly right), open a
   "Calculator doesn't match in-game" issue. Several calculators haven't been checked in-game yet.
2. **Modpack configs.** Add your pack so the calculators match it (below).
3. **Requests.** Tell us which mod or mechanic to decode next. 👍 existing requests instead of duplicating them.

Requests and issues are triaged, not promised. This is a small project.

## Adding a modpack

All pack presets live in one file: [`site/data/packs.js`](site/data/packs.js). You don't need to touch
the calculators.

1. Find the pack's config files: a public repo, the pack download, or your server's `config/` folder.
   If the world has a `serverconfig/` folder, files there override `config/`.
2. Copy an existing entry in `packs.js` and fill it in:
   - `id`: a URL-safe slug (`craftoria`, `atm10-sky`). It is also the deep link: `.../turbine-calculator/#craftoria`.
   - `source`: where the values came from (repo + commit, or pack version).
   - `mods`: one block per supported mod the pack ships. **List only the keys that differ from the mod defaults.**
     Leave a mod out if the pack doesn't include it.
3. Preview locally (below), open a calculator with `#<your-id>`, and check that the numbers under
   "Server config" match the files.
4. Open a pull request.

Keys are written `section.key`, exactly as they appear in the .toml file.

### Extreme Reactors: `config/extremereactors/common.toml`

| Key | Default |
|---|---|
| `general.powerProductionMultiplier` | 1.0 |
| `general.fuelUsageMultiplier` | 1.0 |
| `reactor.reactorPowerProductionMultiplier` | 1.0 |
| `reactor.maxReactorSize` | 32 |
| `reactor.maxReactorHeight` | 48 |
| `turbine.turbinePowerProductionMultiplier` | 1.0 |
| `turbine.maxTurbineSize` | 32 |
| `turbine.maxTurbineHeight` | 32 |
| `turbine.turbineAeroDragMultiplier` | 1.0 |
| `turbine.turbineCoilDragMultiplier` | 1.0 |
| `turbine.turbineMassDragMultiplier` | 1.0 |
| `turbine.turbineFluidPerBladeMultiplier` | 1.0 |

### Mekanism: `config/Mekanism/generators.toml` (and `general.toml`, `machine-usage.toml`)

Defaults are for Mekanism 10.7 (MC 1.21.1). Older Mekanism versions use some different key names
(`turbineBladesPerCoil`, `turbineVentGasFlow`, `gasPerTank`, `energyPerFusionFuel`); write them under the 10.7 names below.

| Key | File | Default |
|---|---|---|
| `fission_reactor.energyPerFissionFuel` | generators.toml | 1000000 |
| `fission_reactor.casingHeatCapacity` | generators.toml | 1000 |
| `fission_reactor.surfaceAreaTarget` | generators.toml | 4 |
| `fission_reactor.burnPerAssembly` | generators.toml | 1 |
| `fusion_reactor.fuelEnergy` | generators.toml | 10000000 |
| `fusion_reactor.thermocoupleEfficiency` | generators.toml | 0.05 |
| `fusion_reactor.casingThermalConductivity` | generators.toml | 0.1 |
| `fusion_reactor.waterHeatingRatio` | generators.toml | 0.3 |
| `fusion_reactor.fuelCapacity` | generators.toml | 1000 |
| `fusion_reactor.waterPerInjection` | generators.toml | 1000000 |
| `turbine.bladesPerCoil` | generators.toml | 4 |
| `turbine.ventChemicalFlow` | generators.toml | 32000 |
| `turbine.disperserChemicalFlow` | generators.toml | 1280 |
| `turbine.condenserRate` | generators.toml | 64000 |
| `turbine.chemicalPerTank` | generators.toml | 64000 |
| `general.maxEnergyPerSteam` | general.toml | 10 |
| `general.feConversionRate` | general.toml | 2.5 |
| `boiler.superheatingHeatTransfer` | general.toml | 16000000 |
| `dynamic_tank.fluidPerTank` | general.toml | 350000 |
| `dynamic_tank.chemicalPerTank` | general.toml | 16000000 |
| `general.maxUpgradeMultiplier` | general.toml | 10 |
| `digital_miner.ticksPerMine` | general.toml | 80 |
| `usage.enrichmentChamber` | machine-usage.toml | 50 |
| `usage.crusher` | machine-usage.toml | 50 |
| `usage.energizedSmelter` | machine-usage.toml | 50 |
| `usage.purificationChamber` | machine-usage.toml | 200 |
| `usage.chemicalInjectionChamber` | machine-usage.toml | 400 |
| `usage.chemicalDissolutionChamber` | machine-usage.toml | 400 |
| `usage.chemicalWasher` | machine-usage.toml | 200 |
| `usage.chemicalCrystallizer` | machine-usage.toml | 400 |
| `usage.chemicalInfuser` | machine-usage.toml | 200 |
| `usage.chemicalOxidizer` | machine-usage.toml | 200 |
| `usage.rotaryCondensentrator` | machine-usage.toml | 50 |
| `kubejs.atmOreProcessing` | 1 if the pack ships ATM's `kubejs/server_scripts/mods/Mekanism/ore_processing.js` (ore processing calculator) | 0 |

### Ryzer Gen: `config/ryzergen-common.toml`

Defaults are for Ryzer Gen 0.1.2-alpha (MC 1.21.1).

| Key | Default |
|---|---|
| `fission_station.output_percent` | 100 |
| `fission_station.water_use_percent` | 100 |
| `water.pump_rate` | 100 |
| `cables.energy_rate` | 1000 |

### Advanced AE: `config/advanced_ae-common.toml`

Defaults are for Advanced AE 1.6.12 (MC 1.21.1). The section name has a space, so keys are written
`"quantum computer.<key>"`.

| Key | Default |
|---|---|
| `quantum computer.quantumComputerMaxSize` | 7 |
| `quantum computer.quantumComputerAcceleratorThreads` | 8 |
| `quantum computer.quantumComputerMaxMultiThreaders` | 1 |
| `quantum computer.quantumComputermaxDataEntanglers` | 1 |
| `quantum computer.quantumComputerMultiThreaderMultiplication` | 4 |
| `quantum computer.quantumComputerDataEntanglerMultiplication` | 4 |

### Colossal Reactors (mod id `colossal_reactors`): `config/colossal_reactors-common.toml` and datapack recipes

Defaults are for Colossal Reactors 2.4.1.0.0 (MC 26.1.2). Config keys keep their numbered prefix, as in the file
(`reactor.size.000_maxReactorWidth`). Fuels, coolants and heat sinks are datapack recipes in
`data/colossal_reactors/recipe/reactor/` and `recipe/turbine/`; a pack replaces them by shipping a file at the same path
(FTB Evolution 2: `datapacks/ftb/data/colossal_reactors/recipe/...`). The calculator reads these as the keys without a prefix.

| Key | Default |
|---|---|
| `reactor.size.000_maxReactorWidth` / `001_maxReactorLength` / `002_maxReactorHeight` | 65 |
| `reactor.base.101b_minRfPerTick` | 500 |
| `reactor.base.101c_minFuelUnitsPerTick` | 0.05 |
| `reactor.base.000_rodMaxFuelUnits` | 10000 |
| `reactor.efficiency.000_rfEfficiencyLoss` | 0.2 |
| `reactor.efficiency.001_fuelEfficiencyLoss` | 1.0 |
| `reactor.efficiency.002_productionMultiplier` | 1.0 |
| `reactor.efficiency.003_consumptionMultiplier` | 1.0 |
| `reactor.consumption.106b_consumptionScale` | 1.72 |
| `reactor.consumption.106b2_consumptionCurveDecayRods` | 400 |
| `reactor.rods.106c_rodAdjacencyPenalty` | 0.25 |
| `reactor.balance.000_rodEnergyScalingMode` / `003_rodFuelScalingMode` | 1 |
| `reactor.balance.001_rodEnergyScalingExponent` | 0.9 |
| `reactor.balance.004_rodFuelScalingExponent` | 1.0 |
| `reactor.balance.002_rodEnergyScalingSaturationK` / `005_rodFuelScalingSaturationK` | 600 |
| `reactor.heatSink.106d_heatSinkAdjacentWeight` | 1.0 |
| `reactor.heatSink.106e_heatSinkNonAdjacentWeight` | 0.5 |
| `reactor.heatSink.106f_heatSinkConsumptionDivisor` | 1.35 |
| `reactor.heatSink.106g_heatSinkRfMultiplier` | 1.16 |
| `reactor.heatSink.106h_heatSinkFuelUnitsMultiplier` | 1.21 |
| `turbine.blade.004_steamMbPerBladePerTick` | 1000 |
| `coolant.water.rf_to_coolant_factor` (reactor_coolant.json, water entry) | 0.45 |
| `coolant.water.steam_per_coolant` (reactor_coolant.json, water entry) | 1.0 |
| `turbine.water.rf_production` (turbine_generation.json, water entry) | 4 |
| `fuel.red_cake`: 1 if reactor_fuel.json lists Red Cake | 1 |
| `heat_sink.industrial_coolant`: 1 if reactor_heat_sinks.json lists `#c:industrial_coolant` | 0 |
| `tag.peridot`: 1 if some block has the `#c:storage_blocks/peridot` tag | 1 |
| `turbine.size.000_maxTurbineWidth` / `001_maxTurbineLength` / `002_maxTurbineHeight` | 65 |
| `turbine.base.101b_minRfPerTick` | 0 |
| `turbine.balance.000_productionMultiplier` / `001_consumptionMultiplier` | 1.0 |
| `turbine.blade.000_maxBladeRing` | 31 |
| `turbine.blade.001_efficiencyBonusPerAscendingLayer` / `002_efficiencyMalusPerDescendingLayer` | 0.03 |
| `turbine.blade.003_requireBalancedBladeRings` (1 = true) | 1 |
| `turbine.coil.000_emptyCoilEfficiency` | 0.3 |
| `coil.ftb`: 1 if elec_coils.json lists FTB's Adamantite, Aeternium and Aurichalcum Turbine Coils | 0 |

### HBM's Nuclear Tech Mod (mod id `hbm`): no config file

Original NTM (1.7.10-1.0.27) has no reactor `.toml`: its tunables are Java constants and, for the RBMK,
gamerule "dials". Preset entries carry values **read out of each fork's code** (verified per fork — see
`research/ntm-1.0.27-reactors.md`). Grouped defaults:

| Key family | Calculator | Defaults |
|---|---|---|
| `zirnox.maxHeat` · `zirnox.meltdownPressure` · `zirnox.heatLossDiv` · `zirnox.steamThreshold` · `zirnox.steamFactor` · `zirnox.co2Fill` · `zirnox.co2Max` · `zirnox.co2TankMax` · `zirnox.steamMax` · `zirnox.waterMax` | ZIRNOX | 100000 · 100000 · 1e6 · 10256 · 125 · 14000 · 16000 · 16000 · 8000 · 32000 |
| `zirnox.rod.<id>.maxLife` / `.heat` (11 rod ids) | ZIRNOX | per `ItemZirnoxRod.EnumZirnoxType` |
| `research.heatPerFlux` · `research.maxHeat` · `research.waterCool` · `research.rodSpeed` | Research reactor | 2 · 50000 · 0.07 · 0.04 |
| `research.plate.<id>.maxLife` / `.reactivity` / `.function` (7 plate ids) | Research reactor | per `ModItems` plate registrations |
| `rbmk.dial.<name>` (24 dials: passiveCooling, innerCooling, columnHeatFlow, diffusionMod, heatProvision, columnHeight, boilerHeatConsumption, controlSpeed, reactivityMod, surgeMod, fluxRange, meltdowns, moderatorEfficiency, absorberEfficiency, absorberHeatConversion, reflectorEfficiency, depletion, xenon, …) | RBMK | per `RBMKDials` (2.5 · 0.1 · 0.2 · 1 · 0.2 · 4 · 0.1 · 1 · 1 · 1 · 5 · on · 1 · 1 · 0.05 · 1 · on · on) |
| `rbmk.fuel.<id>.yield` / `.reactivity` / `.function` / `.depletion` / `.heat` / `.meltingPoint` / `.diffusion` / `.xGen` / `.xBurn` (33 rod ids) | RBMK | per `ModItems` `rbmk_fuel_*` registrations |
| `rbmk.rodHullLimit` · `rbmk.columnMaxHeat` · `rbmk.columnBaseMax` · `rbmk.boilerPerMb` · `rbmk.coolerPerGel` | RBMK | 150 (forks: 1500) · 10000 · 1500 · 0.1 · 200 |
| `fusion.torusMaxPower` · `fusion.klystronMax` · `fusion.klystronAir` · `fusion.intensity2/3/4` · `fusion.mhdtEff` · `fusion.mhdtMinPlasma` · `fusion.boilerTuPerMb` · `fusion.breederFlux` · `fusion.solenoidHE` | Fusion | 1e7 · 1e6 · 2500 · 0.625/0.5/0.4375 · 1.35 · 5e6 · 200 · 10000 · 25000 |
| `fusion.recipe.<id>.ignitionTemp` / `.outputTemp` / `.neutronFlux` / `.duration` (10 recipes) | Fusion | per `FusionRecipes` |
| `pile.maxProgress` · `pile.maxProgress528` · `pile.liProgress` · `pile.liProgress528` · `pile.dissipate` · `pile.dissipateWater` · `pile.maxHeat` · `pile.rayFlux` · `pile.range` · `pile.concreteMult` · `pile.sourceFlux` · `pile.isotopeFlux` · `pile.detectAt` | Graphite pile | 50000 · 75000 · 30000 · 50000 · 0.05 · 0.065 · 1000 · 0.25 · 5 · 0.25 · 1 · 2 · 10 |

## Changing a calculator

Each calculator is one self-contained file: `site/tools/<mod>/<tool>/index.html`. There's no build step.
If you change a formula, say how you checked it: an in-game test (with mod version and pack) or the
mod's public source. Wiki numbers aren't enough on their own.

The turning 3D models on the front page are each calculator's default build, exported to
`site/img/tools/3d/`. If you change a default build or its block textures, re-export them with
`python scripts/export-previews.py` (needs Python Playwright and Chrome). A new calculator also needs
an entry in that script's `TOOLS` list and a `data-model` card on `site/index.html`.

## Preview locally

```bash
python -m http.server 8000 -d site
```

Then open http://localhost:8000.
