# Create Aeronautics 1.3.2 / Simulated 1.3.2 / Sable 2.0.5 / Create Propulsion 1.1.5 — lift, thrust, mass, drag

Traced from bytecode (javap) and data JSON in the jars from the ATM10: Aeronautics 0.6.1 server. Server configs match mod defaults.
Raw dumps: `%TEMP%\aero\notes\` on the dev PC. Planner: `site/tools/create-aeronautics/airship-calculator/`.

- Gravity 11 (DimensionPhysics.DEFAULT_GRAVITY); lift/thrust constants read as "mass held up" at sea level.
- Air pressure p(y): cubic Hermite through (-38.366,1.5), (63,1.0), (263,0.44933), (280,0.41979), (320,0).
- Mass: Sable physics_block_properties tags. weightless 0; super_light 0.25 (envelopes, wool, wooden slabs/stairs, fences, sails…);
  light 0.5 (planks, logs, shafts, cogs, chests…); default 1.0; heavy 2.0 (c:stones, c:cobblestones, obsidian, Propulsion thrusters);
  super_heavy 4.0 (c:storage_blocks, anvils); bedrock 1000; flywheel 4.
- Balloon (ServerBalloon): gas → min(Σ burner/vent output, enclosed capacity); lift = 1.5 × gas × 11 × p(y). Burner 5–500, steam vent up to 5000 × boiler efficiency.
- Levitite 10 / end stone 2 per block, capped at ship mass (preventSelfLift), no pressure scaling.
- Propellers: wooden/andesite/smart thrust 1.0×RPM, airflow 0.1×RPM; propeller/gyro bearing 0.2×P^1.5×RPM, airflow 0.05×√P×RPM; encased fan 0.27×RPM / 0.09×RPM.
  Push × clamp((airflow − forward speed)/airflow, 0, 1) × p(y).
- Propulsion thrusters: base 533.33 / liquid vector & vector 733.33 / ion 800 / solid 200, × fuel multiplier; no pressure or speed falloff (useAtmosphericPressure=false).
- Drag: envelopes/wool 0.33 × N × p × v; levitite 11·N·(0.05+1.5e)·v horizontal (e = exp(-1.5v²/9)); universal drag 0.09 is native — ASSUMED linear 0.09·m·v.

## Worked example (planner reproduces it)
103.75 mass, 193 envelopes, 150 m³ balloon, 1 burner at 500, 2 wooden props aft at 128 RPM → settles Y ≈ 256, top speed 2.5 m/s (4.9 at 256 RPM).

## Not verified
Universal drag form (native); any in-game timing. Rotation/stability not modelled.
