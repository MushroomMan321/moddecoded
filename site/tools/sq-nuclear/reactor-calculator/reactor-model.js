/* SQ-Nuclear 0.99.3-beta.1: the fuel rod drive (pressurized water reactor) and its steam line, steady state.
   Read from the decompiled jar: machine/big/DriveCore, CoreChemistry, BigMachineBlockEntity.vessel() / controlRods() /
   steamGenerator(), turbine/TurbineControllerBlockEntity, reactor/FuelRodBlock(Entity), reactor/PartStages and
   data/nuclearsq/cooling_values.json. NOT YET CHECKED IN GAME: every number lives in SQN_C below so a rig check can
   adjust it in one place. Used by index.html and by test-model.mjs (node), which replays the research model's table. */
(function(root){
"use strict";

/* ===================== constants (all of them) ===================== */
const C = {
  // drive (DriveCore, cooling_values.json control_rod_drive)
  vesselFlow: 640,          // mB/t of hot primary water at "full" (machine extra vessel_flow_mb_t); split over 9 shafts
  shafts: 9,
  rodSteps: 15,             // rod position 0-15 (terminal or redstone); depth = step / 15 for locked rods
  casingCharge: 14400,      // charge per cladding block (FuelRodBlockEntity.UNIT); 4 per rod = 57,600
  casingsPerRod: 4,
  tierOutput: [1, 3.75, 7.5, 12.5],   // FuelRodBlock.OUTPUT, T1..T4: steam from the same charge
  moxPower: 1.3, moxHeat: 1.15, moxXenon: 1.5,   // CoreChemistry.MOX_*
  heatFull: 0.7,            // heat gain per tick at full insertion
  passiveCooling: 0.2,
  coolingPerMb: 0.001,      // per mB of (normalised) flow
  dryHeatPerMb: 0.0025,     // per mB/t the loop can't take
  riseScale: 0.8,           // heat_rise_pct 80: positive net heat is scaled by this
  maxHeat: 1000,            // 100 %
  meltdownTicks: 250,       // at 100 % this long = explosion (12.5 s); cancelled below 90 %
  redZone: 800, recover: 600,
  drivePower: 60,           // FE/t
  drivePort: 5120,          // primary port rate, mB/t
  // moderator and cooler items in the drive controller (cooling_values.json parts, PartStages)
  moderators: [ // [name, power x, heat x]
    ["None", 1, 1], ["Coal", 1.25, 1.2], ["Carbon", 1.5, 1.4], ["Obsidian", 2, 2.2], ["Fluorite", 3, 3.6], ["Heavy water", 4, 4.2]],
  coolers: [["None", 0], ["Heat exchanger", 0.3], ["Active cooler", 0.6], ["Cryo cooling core", 1.0]],
  // chemistry (CoreChemistry)
  xenonFree: 30, xenonFullLoss: 100, xenonLossPct: 40, xenonStop: 100, xenonResume: 60,
  xenonRise: 0.012, xenonDecay: 0.0001, filterRate: 0.01, filterPower: 600, filterTicks: 24000,
  boronLossPct: 50, boronMax: 1000, boronPerItem: 100,
  gasRise: 0.02, recombinerRate: 0.012, gasWarn: 70,
  crudRise: 0.0013, crudLossPct: 15,
  // primary loop
  pumpFlow: 2560, pumpPower: 3600,          // main coolant pump
  hpPumpFlow: 5120, hpPumpPower: 9600,      // high-pressure main coolant pump
  sgPrimary: 2560, sgWet: 1280,             // steam generator: 2 mB primary -> 1 mB wet steam
  preheatBonus: 0.15,                       // preheated feedwater: +15 % steam per mB primary
  pressurizerPower: 1200, containmentPower: 150,
  // steam line (cooling_values.json)
  lineIn: 1280,                              // separator, dryer, reheater: mB/t in each
  separator: 0.9, dryer: 0.975, reheater: 0.8,
  feedHeaterFeed: 640, feedHeaterExhaust: 320,
  // turbine (TurbineControllerBlockEntity, PartStages translators)
  turbineMb: 400, feSteam: 256, feSuper: 384, turbinePush: 160000, turbineTank: 640000,
  translators: [ // [name, FE %, flow %]
    ["None", 100, 100], ["Basic", 100, 100], ["Brass", 110, 150], ["Composite", 125, 200], ["Glowstone", 150, 300]],
  // balance of plant (cooling_values.json)
  condenser: 640, condenserPower: 240,
  waterTreatment: 640, waterTreatmentPower: 360,
  feedPump: 960, feedPumpPower: 480,
  tickPerMin: 1200,
};

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const LINES={dryer:"dryer",separator:"separator",both:"both"};

/* A design:
   { shafts:[{state:"locked"|"unlocked"|"empty", casings:[{tier:1-4, mox:bool, charge:0-100}] x4 (top first)}] x9,
     rod:0-15, moderator:0-5, cooler:0-3, pumps:n, hpPumps:n, sg:n, line:"dryer"|"separator"|"both",
     reheat:bool, preheat:bool, turbines:n, translator:0-4, boron:ppm, xenon:%, deposits:%, containment:bool }
   remaining (optional): per shaft, per casing, charge units left; defaults to charge % of 14,400. */

function chemFactor(d){
  if(d.xenon>=C.xenonStop) return 0;   // poisoned: the core stops until xenon is back under 60 %
  const xe=1-C.xenonLossPct/100*clamp((d.xenon-C.xenonFree)/(C.xenonFullLoss-C.xenonFree),0,1);
  return xe*(1-C.boronLossPct/100*clamp(d.boron,0,C.boronMax)/C.boronMax);
}

// The core and steam line for given charges. Mirrors vessel() + controlRods() + DriveCore.tick() + the steam chain.
function steady(d, remaining){
  const [, modP, modH]=C.moderators[d.moderator], coolerAdd=C.coolers[d.cooler][1];
  const rem=remaining||d.shafts.map(s=>s.casings.map(c=>Math.round(clamp(c.charge,0,100)/100*C.casingCharge)));
  const depth=d.rod/C.rodSteps, perRod=C.vesselFlow/C.shafts;
  let want=0, moxAcc=0, moxN=0, active=0;
  const shaftDepth=[], shaftFuel=[];
  d.shafts.forEach((s,i)=>{
    let fuel=0, tot=0, mox=0;
    if(s.state!=="empty") s.casings.forEach((c,k)=>{ const r=rem[i][k];
      fuel+=r*C.tierOutput[c.tier-1]*(c.mox?C.moxPower:1); if(r>0){ tot+=r; if(c.mox) mox+=r; } });
    const dep=s.state==="locked"&&fuel>0?depth:0;
    shaftDepth.push(dep); shaftFuel.push(fuel/(C.casingCharge*C.casingsPerRod));
    if(dep>0){ want+=perRod*dep*fuel/(C.casingCharge*C.casingsPerRod); moxAcc+=(tot?mox/tot:0)*dep; moxN+=dep; active++; }
  });
  const moxShare=moxN>0?moxAcc/moxN:0, chem=chemFactor(d);
  want*=modP*chem;
  const W=C.vesselFlow*modP;
  const pumpFlow=d.pumps*C.pumpFlow+d.hpPumps*C.hpPumpFlow;
  const supply=Math.min(pumpFlow,C.drivePort), sgCap=C.sgPrimary*d.sg;
  const flow=Math.max(0,Math.min(want,supply,sgCap));
  // what holds the flow back: the drive's own port caps it whatever the pumps; ties name every limit
  const limits=want<=0||flow>=want?[]:[pumpFlow<C.drivePort&&pumpFlow<=flow?"pumps":null,C.drivePort<=flow&&pumpFlow>=C.drivePort?"port":null,sgCap<=flow?"sg":null].filter(Boolean);
  const limit=limits[0]||"none";
  const r=core(want,flow,W,modP,modH,coolerAdd,moxShare,d);
  // steam line
  const pre=d.preheat?1+C.preheatBonus:1;
  const wet=Math.min(flow*pre/2,C.sgWet*d.sg);
  const lineK=LINES[d.line]==="separator"?C.separator:LINES[d.line]==="both"?C.separator*C.dryer:C.dryer;
  let steam=wet*lineK; if(d.reheat) steam*=C.reheater;
  const [, fePct, flowPct]=C.translators[d.translator];
  const cap=C.turbineMb*flowPct/100*d.turbines;
  const used=Math.min(steam,cap), feMb=d.reheat?C.feSuper:C.feSteam;
  const fe=used*feMb*fePct/100;
  // burn: 1 charge per tick per shaft at full depth, x moderator power x chemistry x the share of the wanted flow that ran
  const done=want>0?flow/want:0, burn=depth*modP*chem*done;
  return {want,flow,W,supply,pumpFlow,sgCap,limit,limits,moxShare,chem,active,shaftDepth,shaftFuel,
    ...r, wet, steam, cap, used, fe, feMb, fePct, flowPct, lineK, pre, done, burn, depth, modP};
}

// heat gain vs cooling for a given wanted and actual primary flow (DriveCore.tick as called by controlRods)
function core(want,flow,W,modP,modH,coolerAdd,moxShare,d){
  const missing=(want-flow)/modP;
  const norm=want>0?Math.min(1,W/want):1;
  const ins=want>0?Math.min(1,want/W):0;
  const gain=ins*C.heatFull*modH*(1+(C.moxHeat-1)*moxShare)+missing*norm*C.dryHeatPerMb;
  const cooling=C.passiveCooling+(flow*norm*C.coolingPerMb+coolerAdd)*(1-C.crudLossPct/100*clamp(d.deposits,0,100)/100);
  const net=gain-cooling;
  // heat sits at 0 unless gain > cooling; then it climbs at net x 0.8 per tick to 1000, and explodes 250 ticks later
  const toFull=net>0?C.maxHeat/(net*C.riseScale):Infinity;
  return {missing,norm,ins,gain,cooling,net,safe:net<=0,toFull,toBoom:toFull+C.meltdownTicks,toRed:net>0?C.redZone/(net*C.riseScale):Infinity};
}

// When the turbines take less steam than the line makes, the tanks fill (turbine 640,000 mB, then the line and the
// steam generators), the generators stop, the hot primary tank fills and the vessel can only move what the turbines use.
// Inferred from the code (no steam vent in the chain); this is that backed-up state.
function backedUp(d,s){
  if(!(s.steam>s.cap+1e-9)||s.flow<=0) return null;
  const perPrimary=s.steam/s.flow;            // steam per mB primary in this chain
  const flow=s.cap/perPrimary;
  const [, modP, modH]=C.moderators[d.moderator];
  const r=core(s.want,flow,s.W,modP,modH,C.coolers[d.cooler][1],s.moxShare,d);
  const excess=s.steam-s.cap;
  return {flow,excess,fillTicks:C.turbineTank*Math.max(1,d.turbines)/excess,...r};
}

// Burn the core down: steps of 1 % of a casing, top casing of each shaft first (burnRod), output re-solved each step.
function life(d){
  const rem=d.shafts.map(s=>s.casings.map(c=>Math.round(clamp(c.charge,0,100)/100*C.casingCharge)));
  const step=C.casingCharge/100;
  let t=0, energy=0, first=Infinity, guard=0;
  const emptyAt=d.shafts.map(()=>null);
  const fresh=steady(d,rem);
  if(fresh.burn<=0||fresh.want<=0) return {fresh,ticks:Infinity,avg:fresh.fe,energy:Infinity,first:Infinity,emptyAt};
  for(;;){
    const s=steady(d,rem);
    if(s.want<=0||s.burn<=0||guard++>20000) break;
    // each loaded shaft burns s.burn charges a tick; take a step that uses at most `step` of any casing
    const dt=step/s.burn;
    energy+=s.fe*dt; t+=dt;
    d.shafts.forEach((sh,i)=>{
      if(s.shaftDepth[i]<=0) return;
      let left=step;
      for(let k=0;k<rem[i].length&&left>0;k++){ const take=Math.min(rem[i][k],left); rem[i][k]-=take; left-=take; }
      if(emptyAt[i]==null&&rem[i].every(r=>r<=0)){ emptyAt[i]=t; first=Math.min(first,t); }
    });
  }
  return {fresh,ticks:t,avg:t>0?energy/t:0,energy,first,emptyAt};
}

// Xenon: rises 0.012 %/t x min(1, insertion / loss) x (1 + 0.5 MOX share), decays 0.01 % of itself, minus 0.01 per filter.
function xenon(ins,moxShare,filters,x0){
  const xf=1+(C.moxXenon-1)*moxShare;
  const rate=x=>{ const loss=1-C.xenonLossPct/100*clamp((x-C.xenonFree)/(C.xenonFullLoss-C.xenonFree),0,1);
    return Math.min(1,ins/loss)*C.xenonRise*xf-x*C.xenonDecay-(x>0?filters*C.filterRate:0); };
  // filters to hold it at or under 30 %, where it costs nothing
  const need=ins>0?Math.max(0,Math.ceil((ins*C.xenonRise*xf-C.xenonFree*C.xenonDecay)/C.filterRate-1e-9)):0;
  let x=clamp(x0,0,100), t=0;
  while(t<20*3600*20&&x<C.xenonStop){ const r=rate(x); if(r<=1e-7) break; x=Math.min(100,x+r*20); t+=20; }
  // equilibrium with this many filters (or where it stops)
  let eq=clamp(x0,0,100); for(let i=0;i<200000;i++){ const r=rate(eq); if(Math.abs(r)<1e-9) break; eq=clamp(eq+r*50,0,100); if(eq>=100) break; }
  return {need,stopTicks:x>=C.xenonStop?t:Infinity,eq};
}

// Hydrogen ("detonating gas"): +0.02 %/t x insertion, -0.012 per recombiner within 24 blocks; at 100 % it blows the hull.
function hydrogen(ins,recombiners){
  const net=ins*C.gasRise-recombiners*C.recombinerRate;
  return {need:ins>0?Math.ceil(ins*C.gasRise/C.recombinerRate-1e-9):0, net, toFull:net>0?100/net:Infinity};
}

// The whole plant, sized to the design
function plant(d,s){
  const feed=s.wet, exhaust=s.used;
  const condensers=Math.ceil(exhaust/C.condenser-1e-9), treatment=Math.ceil(feed/C.waterTreatment-1e-9),
    feedPumps=Math.ceil(feed/C.feedPump-1e-9), feedHeaters=d.preheat?Math.ceil(feed/C.feedHeaterFeed-1e-9):0;
  const separators=d.line==="dryer"?0:Math.ceil(s.wet/C.lineIn-1e-9);
  const dryers=d.line==="separator"?0:Math.ceil((d.line==="both"?s.wet*C.separator:s.wet)/C.lineIn-1e-9);
  const reheaters=d.reheat?Math.ceil(s.wet*s.lineK/C.lineIn-1e-9):0;
  const x=xenon(s.ins,s.moxShare,0,d.xenon), h=hydrogen(s.ins,0);
  const load=[
    ["Fuel rod drive",1,C.drivePower],
    ["Main coolant pump",d.pumps,C.pumpPower],
    ["High-pressure pump",d.hpPumps,C.hpPumpPower],
    ["Pressurizer (while heating)",1,C.pressurizerPower],
    ["Containment",d.containment?1:0,C.containmentPower],
    ["Condenser",condensers,C.condenserPower],
    ["Water treatment",treatment,C.waterTreatmentPower],
    ["Feedwater pump",feedPumps,C.feedPumpPower],
    ["Xenon filter",x.need,C.filterPower],
  ].filter(r=>r[1]>0);
  const baseLoad=load.reduce((a,[,n,p])=>a+n*p,0);
  return {feed,exhaust,condensers,treatment,feedPumps,feedHeaters,separators,dryers,reheaters,
    recombiners:h.need,gas:h,xenon:x,filters:x.need,load,baseLoad,turbinesFor:s.steam>0?Math.ceil(s.steam/(C.turbineMb*s.flowPct/100)-1e-9):0};
}

// The research model's flat API (notes/scripts/reactor_model.py run()), for the oracle test
function researchRun(o){
  const tier=o.tier||1, rods=o.rods??9, level=o.rod_level??15, mox=!!o.mox;
  const d={shafts:Array.from({length:9},(_,i)=>({state:i<rods?"locked":"empty",casings:Array.from({length:4},()=>({tier,mox,charge:100}))})),
    rod:level,moderator:o.mod||0,cooler:o.cooler||0,pumps:0,hpPumps:2,sg:o.sg||1,line:o.dryer||"dryer",reheat:!!o.reheat,preheat:!!o.preheat,
    turbines:o.turbines||1,translator:o.translator||0,boron:0,xenon:0,deposits:0,containment:false};
  const s=steady(d);
  // reactor_model.py's rod life: a full rod at this depth and moderator, flow shortfall ignored
  const lifeFullFlow=level?C.casingCharge*C.casingsPerRod/(level/15*C.moderators[d.moderator][1])/C.tickPerMin:Infinity;
  return {d,s,row:{want:Math.round(s.want),flow:Math.round(s.flow),heat_gen:+s.gain.toFixed(3),cooling:+s.cooling.toFixed(3),safe:s.gain<=s.cooling,
    wet:Math.round(s.wet),steam:Math.round(s.steam),turbine_cap:Math.round(s.cap),fe_t:Math.round(s.fe),rod_life_min:+lifeFullFlow.toFixed(1)}};
}

root.SQN={C,steady,core,backedUp,life,xenon,hydrogen,plant,chemFactor,researchRun};
})(typeof window!=="undefined"?window:globalThis);
