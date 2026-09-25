# Adds server-config presets (mod defaults / ATM10 / custom) to the turbine planner.
# One-off patch script, kept for the record of what changed and why.
p = r'C:\Users\jorda\modded-mechanics\site\tools\extreme-reactors\turbine-planner\index.html'
s = open(p, encoding='utf8').read()


def R(a, b, count=1):
    global s
    n = s.count(a)
    assert n == count, (n, a[:90])
    s = s.replace(a, b)


# ---------- CSS
R('/* loadout */', '''/* server config */
.cfg-hint{font-family:var(--font-mono);font-size:12.5px;color:var(--muted);margin:0}
.cfg-hint b{color:var(--ink);font-weight:600}
details.cfg summary{cursor:pointer;font-size:14px;color:var(--muted);width:max-content}
details.cfg summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cfg-grid{display:grid;grid-template-columns:minmax(0,1fr) 90px;gap:6px 10px;align-items:center;margin-top:10px}
.cfg-grid label{font-family:var(--font-mono);font-size:12.5px;color:var(--muted);overflow-wrap:anywhere}

/* loadout */''')

# ---------- HTML: config section above the turbine section
R('''      <div class="sect">
        <h2>Turbine</h2>''', '''      <div class="sect">
        <h2>Server config</h2>
        <div class="seg" role="group" aria-label="Server config preset">
          <button type="button" id="pDefault" aria-pressed="true">Mod defaults</button>
          <button type="button" id="pAtm10" aria-pressed="false">All the Mods 10</button>
          <button type="button" id="pCustom" aria-pressed="false">Custom</button>
        </div>
        <p class="cfg-hint" id="cfgHint"></p>
        <details class="cfg" id="cfgMore">
          <summary>Edit values from config/extremereactors/common.toml</summary>
          <div class="cfg-grid" id="cfgGrid"></div>
        </details>
      </div>

      <div class="sect">
        <h2>Turbine</h2>''')

# ---------- data: true variant limits; config supplies the rest
R('reinforced: {name:"Reinforced", maxX:32, maxY:32, maxZ:32, maxFlow:2000,',
  'reinforced: {name:"Reinforced", maxX:1000, maxY:1000, maxZ:1000, maxFlow:2000,')
R('''// TurbineVariant: Basic = Builder.create(5, 10) -> 5 x 10 x 5; Reinforced = create(1000) -> config-bound 32 x 32 x 32''',
  '''// TurbineVariant: Basic = Builder.create(5, 10) -> 5 x 10 x 5; Reinforced = create(1000) -> bound by config
// Server config (config/extremereactors/common.toml). Where each one applies, per the bytecode:
//   power, turbinePower -> MultiblockTurbine.getAdjustedPowerProductionMultiplier (energy only, not drag/RPM)
//   aero  -> TurbineData.update bladeDrag;  coil -> INDUCTOR_BASE_DRAG_COEFFICIENT;  mass -> frictionalDrag
//   fluid -> TurbineData ctor: inputFluidPerBlade = floor(basePerBlade * fluid)
const PRESETS = {
  default: {name:"Mod defaults",    power:1,   turbinePower:1,   maxSize:32, maxHeight:32, aero:1, coil:1, mass:1, fluid:1},
  atm10:   {name:"All the Mods 10", power:0.5, turbinePower:0.8, maxSize:16, maxHeight:16, aero:1, coil:1, mass:1, fluid:1},
};
const CFG_FIELDS = [
  ["power","general.powerProductionMultiplier",0.005,100],
  ["turbinePower","turbine.turbinePowerProductionMultiplier",0.005,100],
  ["maxSize","turbine.maxTurbineSize",5,256],
  ["maxHeight","turbine.maxTurbineHeight",5,256],
  ["aero","turbine.turbineAeroDragMultiplier",0.5,10],
  ["coil","turbine.turbineCoilDragMultiplier",0.5,10],
  ["mass","turbine.turbineMassDragMultiplier",0.5,10],
  ["fluid","turbine.turbineFluidPerBladeMultiplier",0.5,10],
];
let cfgPreset="default", cfg={...PRESETS.default};
try{ const saved=JSON.parse(localStorage.getItem("er-turbine-cfg")||"null"); if(saved&&saved.cfg){ cfgPreset=saved.preset; cfg={...PRESETS.default,...saved.cfg}; } }catch(e){}
function tier(v){ const V=VARIANTS[v];
  return {...V, maxX:Math.min(V.maxX,cfg.maxSize), maxZ:Math.min(V.maxZ,cfg.maxSize), maxY:Math.min(V.maxY,cfg.maxHeight),
    perBlade:Math.max(1,Math.floor(V.perBlade*cfg.fluid))}; }''')

# ---------- every variant lookup goes through tier()
R('VARIANTS[s.variant]', 'tier(s.variant)')
R('VARIANTS[state.variant]', 'tier(state.variant)', count=6)

# ---------- apply multipliers in the model
R('indCoef=C>0?INDUCTOR_BASE*sX:0;', 'indCoef=C>0?INDUCTOR_BASE*cfg.coil*sX:0;')
R('const bladeCoef=BLADE_DRAG*B, friction=mass*V.rotorDrag, k=indCoef+bladeCoef;',
  'const bladeCoef=BLADE_DRAG*cfg.aero*B, friction=mass*V.rotorDrag*cfg.mass, k=indCoef+bladeCoef;')
R('const fr=raw>0?rpmFactor(rpm):0, rf=raw*fr;', 'const fr=raw>0?rpmFactor(rpm):0, rf=raw*fr*cfg.power*cfg.turbinePower;')
R('${fmt((lay.H-lay.minH)*V.shaftMass*V.rotorDrag,2)} RF/t', '${fmt((lay.H-lay.minH)*V.shaftMass*V.rotorDrag*cfg.mass,2)} RF/t')

# ---------- casing hint names the real source of the limit
R('''(state.variant==="basic"?" Basic width is fixed at 5.":" The 32 limit comes from the maxTurbineSize and maxTurbineHeight config values.");''',
  '''(state.variant==="basic"?` Basic turbines are capped at 5 × 10 × 5 by the mod itself${cfg.maxSize<5||cfg.maxHeight<10?", and lower here by the server config":""}.`:` These limits come from maxTurbineSize (${cfg.maxSize}) and maxTurbineHeight (${cfg.maxHeight}) in the server config.`);''')

# ---------- config UI logic, wired before first update
R('/* wiring */', '''/* server config */
function renderCfg(){
  for(const [id,key] of [["pDefault","default"],["pAtm10","atm10"],["pCustom","custom"]]) $(id).setAttribute("aria-pressed",cfgPreset===key);
  const mult=cfg.power*cfg.turbinePower;
  $("cfgHint").innerHTML=`Power <b>×${fmt(mult,2)}</b> (${cfg.power} × ${cfg.turbinePower}) · max casing <b>${cfg.maxSize}×${cfg.maxSize}×${cfg.maxHeight}</b>`+
    (cfg.aero!==1||cfg.coil!==1||cfg.mass!==1||cfg.fluid!==1?` · drag/fluid multipliers changed`:``);
  const g=$("cfgGrid");
  if(!g.childElementCount){
    for(const [k,label,min,max] of CFG_FIELDS){
      const l=document.createElement("label"); l.htmlFor="cfg-"+k; l.textContent=label;
      const i=document.createElement("input"); i.className="num"; i.type="number"; i.id="cfg-"+k; i.min=min; i.max=max; i.step="any";
      i.onchange=()=>{ const v=+i.value; if(!Number.isFinite(v)){ i.value=cfg[k]; return; } cfg[k]=Math.min(max,Math.max(min,k.startsWith("max")?Math.floor(v):v)); cfgPreset="custom"; saveCfg(); update(); };
      g.append(l,i);
    }
  }
  for(const [k] of CFG_FIELDS) $("cfg-"+k).value=cfg[k];
}
function saveCfg(){ try{ localStorage.setItem("er-turbine-cfg",JSON.stringify({preset:cfgPreset,cfg})); }catch(e){} }
function usePreset(key){ cfgPreset=key; if(PRESETS[key]) cfg={...PRESETS[key]}; else $("cfgMore").open=true; saveCfg(); update(); }
$("pDefault").onclick=()=>usePreset("default"); $("pAtm10").onclick=()=>usePreset("atm10"); $("pCustom").onclick=()=>usePreset("custom");

/* wiring */''')
R('  syncInputs(); renderSlots(); renderLoad();', '  renderCfg(); syncInputs(); renderSlots(); renderLoad();')

# ---------- one more "what the code says" card
R('''        <span class="ref">TurbineData.update · TurbineVariant</span>
      </div>
    </div>''', '''        <span class="ref">TurbineData.update · TurbineVariant</span>
      </div>
      <div class="fact">
        <h3>Your modpack may scale the power</h3>
        <p>Packs can change two power multipliers in the server config. They scale RF/t only; drag and RPM stay the same. All the Mods 10 sets them to 0.5 and 0.8, so its turbines make 40% of the default power at exactly the same RPM.</p>
<pre>rf/t × powerProductionMultiplier
     × turbinePowerProductionMultiplier</pre>
        <span class="ref">MultiblockTurbine.getAdjustedPowerProductionMultiplier</span>
      </div>
    </div>''')

open(p, 'w', encoding='utf8').write(s)
print('ok')
