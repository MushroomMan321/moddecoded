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

### Mekanism: `config/Mekanism/generators.toml` (and `general.toml`)

Defaults are for Mekanism 10.7 (MC 1.21.1). Older Mekanism versions use some different key names
(`turbineBladesPerCoil`, `turbineVentGasFlow`, `gasPerTank`); write them under the 10.7 names below.

| Key | File | Default |
|---|---|---|
| `fission_reactor.energyPerFissionFuel` | generators.toml | 1000000 |
| `fission_reactor.casingHeatCapacity` | generators.toml | 1000 |
| `fission_reactor.surfaceAreaTarget` | generators.toml | 4 |
| `fission_reactor.burnPerAssembly` | generators.toml | 1 |
| `turbine.bladesPerCoil` | generators.toml | 4 |
| `turbine.ventChemicalFlow` | generators.toml | 32000 |
| `turbine.disperserChemicalFlow` | generators.toml | 1280 |
| `turbine.condenserRate` | generators.toml | 64000 |
| `turbine.chemicalPerTank` | generators.toml | 64000 |
| `general.maxEnergyPerSteam` | general.toml | 10 |
| `general.feConversionRate` | general.toml | 2.5 |
| `boiler.superheatingHeatTransfer` | general.toml | 16000000 |

## Changing a calculator

Each calculator is one self-contained file: `site/tools/<mod>/<tool>/index.html`. There's no build step.
If you change a formula, say how you checked it: an in-game test (with mod version and pack) or the
mod's public source. Wiki numbers aren't enough on their own.

## Preview locally

```bash
python -m http.server 8000 -d site
```

Then open http://localhost:8000.
