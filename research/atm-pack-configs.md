# All the Mods pack configs (checked 2026-09-25)

> The calculators read these values from `site/data/packs.js`. Update that file, not this note, when a pack changes.

Source: each pack's public repo under github.com/AllTheMods, default branch `main`, at the commit listed.
These are repo HEADs, not release tags, so a pack's current release can differ.

| Pack | Repo @ commit | MC |
|---|---|---|
| ATM10 | ATM-10 @ e5e3d1d | 1.21.1 |
| ATM10: Aeronautics | ATM-10-a @ d876358 (README: "All The Mods 10 - Aeronautics Edition") | 1.21.1 |
| ATM10 To The Sky | All-the-mods-10-Sky @ 53b95da | 1.21.1 |
| All the Mons | All-the-Mons @ 56b5a4a | 1.21.1 |
| ATM10 Lite | ATM-10-L @ 6186086 | 1.21.1 |
| ATM9 | ATM-9 @ 255ca23 | 1.20.1 |
| ATM9 To The Sky | All-the-mods-9-Sky @ 3363206 | 1.20.1 |
| ATM8 | ATM-8 @ eda4ddf | 1.19.2 |
| ATM11 | ATM-11 (MC 26.1) | no Extreme Reactors or Mekanism in config/crash_assistant/modlist.json yet |

## Extreme Reactors (config/extremereactors/common.toml)

Defaults come from the file's own `# Default:` comments: every multiplier is 1.0, reactor max 32 wide × 48 tall,
turbine max 32 × 32. Power multiplier ranges are 0.5 to 100.

| Pack | power | reactorPower | turbinePower | fuelUsage | reactor max | turbine max |
|---|---|---|---|---|---|---|
| defaults | 1.0 | 1.0 | 1.0 | 1.0 | 32×48 | 32×32 |
| ATM10 / ATM10 Sky / All the Mons | 4.0 | 3.0 | 3.0 | 0.8 | 32×48 | 32×32 |
| ATM10: Aeronautics | 0.5 | 0.8 | 0.8 | 1.2 | 32×32 | 16×16 |
| ATM9 | 1.0 | 3.0 | 3.0 | 1.0 | 32×48 | 32×32 |

No ER config: ATM10 Lite, ATM9 Sky, ATM8. ATM9 runs an older ER build (1.20.1). The calculators model 2.4.28.

## Mekanism (config/Mekanism/generators.toml + general.toml)

Defaults are from GeneratorsConfig.java at v1.21.1-10.7.19.85. These 1.21 configs have no `# Default:` comments.
Defaults: energyPerFissionFuel 1,000,000, casingHeatCapacity 1000, surfaceAreaTarget 4, burnPerAssembly 1, bladesPerCoil 4,
ventChemicalFlow 32000, disperserChemicalFlow 1280, condenserRate 64000, turbine chemicalPerTank 64000.

| Pack | energyPerFissionFuel | casingHeatCap | surfaceAreaTarget | bladesPerCoil | vent | condenser | turbine chemicalPerTank |
|---|---|---|---|---|---|---|---|
| ATM10 / All the Mons | 250,000 | 1000 | 4 | 8 | 43478.262 | 128000 | 6400 |
| ATM10: Aeronautics | 8,000 | 1000 | 4 | 8 | 43478.262 | 128000 | 6400 |
| ATM10 To The Sky | 2,800,000 | 4000 | 1.8 | 4 | 43478.262 | 128000 | 64000 |
| ATM10 Lite, ATM9, ATM9 Sky, ATM8 | defaults | | | | | | |

ATM9/ATM9 Sky/ATM8 use the older key names (turbineBladesPerCoil, turbineVentGasFlow, gasPerTank) and store
energyPerFissionFuel as a string. They run older Mekanism, while the calculator models 10.7.
All packs: maxEnergyPerSteam 10, feConversionRate 2.5, superheatingHeatTransfer 1.6E7 (where set).
