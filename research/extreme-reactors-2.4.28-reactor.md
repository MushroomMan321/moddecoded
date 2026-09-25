# Extreme Reactors 1.21.1-2.4.28 — fission reactor simulation

Traced from bytecode with `javap -c -p` (no decompiler). Raw dumps from the trace are in
`%TEMP%\er\reactor-notes\` on the dev PC. The reactor planner
(`site/tools/extreme-reactors/reactor-calculator/`) runs this loop tick by tick.

## Per-tick order (`ReactorLogic.update`)

1. **Irradiate** (reactor on): one fuel-rod block fires, round-robin over all rod blocks
   (`FuelRodsMap.getNextIrradiationSource`). Strength uses the whole reactor's fuel:
   ```
   raw       = (fuel + floor(waste/100)) × fissionEventsPerFuelUnit
   scaled    = ((raw^r) / controlRodCount)^r × controlRodCount        # r = reaction reactivity
   raw, scaled ×= (100 − insertion)/100                                 # source rod's column
   intensity = scaled × (1 − 0.95·exp(−10·exp(−0.0012·Tfuel)))
   hardness  = 0.2 + 0.8·exp(−15·exp(−0.0025·Tfuel))
   fuel/t    = fuelUnitsPerFissionEvent × raw / fertilityModifier × fuelUsageMultiplier
   fuelEnergy = 10 × intensity                                           # self-absorbed
   ```
   Then 4 rays of `0.25 × intensity`, **perpendicular to the rod axis only**, max 4 blocks,
   stop below 1e-4. Per block:
   - moderator: `absorbed = I·abs·(1−h)`, `I −= absorbed`, `h /= moderation`, `env += absorbed·heatEff·10`
   - fuel rod: `sAbs = min(1, (1−0.95·exp(−10·exp(−0.0022·Tf)))·(1 − h/hardnessDivisor)·absorptionCoeff)`;
     control rod insertion adds `(1−sAbs)·cr·0.5` to radiation absorbed (→ fuel heat ×10) and removes
     `sAbs·cr·0.5` from fertility gain; `h /= mf + mf·cr + cr`
   - any reactor part (casing, glass, ports, control rods): `I = 0`, no heat.
   `fuelHeat += fuelEnergy/(rodBlocks·10)`, `casingHeat += env/(interiorVolume·10)`.
2. **Fertility decay**: `f = max(0, f − max(0.1, f/20))` (÷4000 instead of ÷20 when the reactor is off).
   `fertilityModifier = f ≤ 1 ? 1 : log10(f) + 1`.
3. Refuel / waste eject (ports).
4. **Fuel → casing** (one-way): if `ΔT > 0.01`, `q = ΔT × Σ_rodBlocks(Σ 4 sideways neighbour conductivities)`;
   casing/ports 0.6, air 0.05, other rods 0.05, moderator = its conductivity.
5. **Casing → coolant**: coefficient `0.6 × internalArea`.
   - Passive: coolant fixed at 20 °C, `q ×= 0.2`, `RF = q × 0.5 × powerMult × reactorPowerMult × genEff`.
     ⇒ `RF/t = 0.06 × internalArea × (T − 20) × multipliers`.
   - Active: coolant at `min(T, 100)`; water boiled `= min(fluidCap, trunc(q/4))`, steam `= trunc(water × 0.85)`.
     `fluidCap = clamp(casingBlocks × 1000, 0, 200000)` (Reinforced). Basic has 0 → no active mode.
6. **Heat loss to world**: `max(1, (T−20) × 0.001 × externalArea)`.

## Constants

- Fuel rod capacity 4,000 mB per rod block. 1 ingot = 1,000 mB.
- Fuels `(moderationFactor, absorptionCoeff, hardnessDivisor, fissionEventsPerFuelUnit, fuelUnitsPerFissionEvent)`:
  Yellorium 1.5, 0.5, 1.0, 0.01, 7e-4 · Blutonium 2.23, 0.6, 2.0, 0.0137, 6e-4 · Verderium 3.74, 0.8741, 2.0049, 0.0312, 0.0081.
- Reactivity: Yellorium 1.05, Blutonium 1.0871, Verderium 1.0984.
- Air moderator 0.1 / 0.25 / 1.1 / 0.05; water 0.33 / 0.5 / 1.33 / 0.1. Full table in the planner source.
- Variants: Basic genEff 0.8, max 5; Reinforced genEff 1.0, max 1000 (config-bound), vapour eff 0.85.
- Config defaults: power 1.0, reactorPower 1.0, fuelUsage 1.0, maxReactorSize 32, maxReactorHeight 48.

## Planner assumptions

- Fuel is held full (auto-refuel) and waste auto-ejected, so fuel reactivity is 100%.
- Vertical rods spanning the full interior height; every column's layers behave identically.
- Active mode: unlimited water in, steam removed every tick.
- Steady state = casing temperature averaged over windows of (multiple of rod count) ticks, stable
  within max(0.05 °C, 0.01%) twice in a row.

## Not yet verified in-game

Everything above. The turbine model matched in-game exactly once pack config was applied; the reactor
needs its own check (casing temp, RF/t or steam, fuel burn on a known layout).
