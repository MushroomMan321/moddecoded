# Extreme Reactors 1.21.1-2.4.28 — turbine mechanics

Source: `ExtremeReactors2-1.21.1-2.4.28` jar, `Implementation-Timestamp: 2025-12-17`.
Read with `javap -c -p` (JDK 25). No decompiler; every value below was taken from bytecode.
Default config assumed (all multipliers 1.0).

## Where each number lives

| Value | Class / method |
|---|---|
| Coil stats (efficiency, bonus, extraction rate) | `gamecontent.TurbineGameData.registerCoils` → `CoilMaterialRegistry.register(tag, eff, bonus, extraction)` |
| Coil averaging | `TurbineData.update`, `TurbineData$CoilStats.accept` |
| Per-tick energy, RPM factor | `TurbineLogic.update` |
| Rotor speed | `MultiblockTurbine.getRotorSpeed` = rotorEnergy / (blades × rotorMass) |
| Rotor energy clamp | `TurbineData.setRotorEnergy` (only `max(0, x)`, no upper clamp) |
| Tier constants | `TurbineVariant.<clinit>` via `TurbineVariant$Builder` |
| Size limits | `TurbineVariant.getMaximum{X,Y,Z}Size` = min(config, variant) |
| Steam energy | `ReactorGameData.registerCoolantsAndVapors` → steam = 10 RF/mB |

## Formulas

```
flow        = min(intake, steam available)
used        = min(blades × perBlade, flow)
steamRF     = used × 10
if used < flow:
    needed  = floor(flow / perBlade)
    steamRF += (flow − used) × 10 × (1 − (needed − blades) / needed)

n           = coil block count
eff         = Σefficiency × 0.33 / n
bonus       = max(1, Σbonus / n)
indCoef     = 0.1 × Σextraction          # (avg extraction × 0.1) × n
bladeDrag   = 0.00025 × blades
friction    = rotorMass × 0.01           # constant, speed-independent
rotorMass   = blades × bladeMass + shaftBlocks × shaftMass

drag        = rpm × indCoef
rpmFactor   = 0.25·cos(rpm / 142.94246573833559) + 0.75 ; if rpm < 500: min(0.5, ·)
RF/t        = drag^bonus × eff × rpmFactor

steady rpm  = (steamRF − friction) / (indCoef + bladeDrag)
```

## Tier constants

| | Basic | Reinforced |
|---|---|---|
| Max exterior X × Y × Z | 5 × 10 × 5 (`create(5, 10)`) | 32 × 32 × 32 (`create(1000)`, config-bound) |
| Max intake (mB/t) | 1000 | 2000 |
| mB/t per blade | 15 | 25 |
| Blade / shaft mass | 8 / 8 | 10 / 10 |
| Rotor drag coefficient | 0.01 | 0.01 |
| Gauge max RPM | 1000 | 2000 |

`energyGenerationEfficiency` (0.8 Basic / 1.0 Reinforced) is not referenced by TurbineLogic or TurbineData.

## In-game validation

**2026-09-25, All the Mods 10 (ER 2.4.28), Reinforced turbine** — 5×5×16 exterior, blade length 1,
43 blades, 24 platinum coils, 1082 mB/t steam:

| | In-game controller | Planner |
|---|---|---|
| Rotor speed | 1798.74 RPM | 1,799 RPM |
| Output | 4.27 kFE/t | 4,275 RF/t (ATM10 preset) |

The first comparison showed the planner at 10,686 RF/t, exactly 2.5× too high. The cause was ATM10's
`config/extremereactors/common.toml`, not the formulas: `powerProductionMultiplier = 0.5` and
`turbinePowerProductionMultiplier = 0.8` (0.5 × 0.8 = 0.4). ATM10 also sets
`maxTurbineSize = 16` and `maxTurbineHeight = 16`. These multipliers scale energy only; RPM is untouched,
which is why the RPM matched on the first try.

ATM10's KubeJS does not change coil stats (only ER recipes).

## Not yet verified

- A second in-game data point with a coil whose bonus is > 1 (tests the exponent term).
- Where blades and coils may sit along the shaft (planner assumes blades at the bearing end, coils above).
- Minimum multiblock size (lives in ZeroCore, not in this jar).
