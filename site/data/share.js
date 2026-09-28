/* Share box for the calculators: a design code in the page link (#d=<code>, optionally after a pack preset: #atm10&d=<code>),
   a text field that shows the current code and loads a pasted code or link, and copy buttons.
   Each calculator supplies its own encode/decode; each format is described above that calculator's encodeDesign.

   Page markup: #dCode (text input), #dLink and #dCopy (buttons), #dMsg (status line).
   Usage:
     const share = mdShare({prefix:"mdt1", isPreset:k=>!!PRESETS[k], encode, decode, apply, preset:()=>cfgPreset});
     share.atLoad            -> {preset, design} parsed from the link on page load (design already decoded, or null)
     share.render()          -> call at the end of every update
     share.live()            -> call once after the first update, so a plain visit keeps a clean URL
   apply(design) must store the design and re-render the page. preset() returns the current pack preset key. */
(function(){
"use strict";
const b64u={
  enc:b=>{ let s=""; for(const x of b) s+=String.fromCharCode(x); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); },
  dec:s=>{ if(!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error("not base64url"); return Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)); },
};
// n values of `bits` bits each, least significant bit first, into ceil(n*bits/8) bytes
function packBits(vals,bits){ const out=new Uint8Array(Math.ceil(vals.length*bits/8));
  vals.forEach((v,i)=>{ for(let b=0;b<bits;b++) if(v>>b&1){ const p=i*bits+b; out[p>>3]|=1<<(p&7); } }); return out; }
function unpackBits(bytes,n,bits){ if(bytes.length!==Math.ceil(n*bits/8)) return null; const vals=new Array(n);
  for(let i=0;i<n;i++){ let v=0; for(let b=0;b<bits;b++){ const p=i*bits+b; if(bytes[p>>3]>>(p&7)&1) v|=1<<b; } vals[i]=v; } return vals; }
const safeDecode=s=>{ try{ return decodeURIComponent(s); }catch(e){ return s; } };
// Cloudflare's analytics beacon counts every same-page URL change it sees through the Navigation API as a pageview,
// so the live link updates below would log one per edit. This listener is added before the beacon's (it loads as a
// deferred module) and hides our own replaceState from it. Browsers without the Navigation API don't report replaceState.
let quietNav=false;
if(window.navigation&&navigation.addEventListener) navigation.addEventListener("navigate",e=>{ if(quietNav) e.stopImmediatePropagation(); });
const quietReplace=u=>{ quietNav=true; try{ history.replaceState(null,"",u); }catch(e){} finally{ quietNav=false; } };

function mdShare(o){
  const $=id=>document.getElementById(id), box=$("dCode"), msg=$("dMsg");
  const find=v=>{ const m=new RegExp(o.prefix.replace(/\./g,"\\.")+"\\.[^&\\s#]+").exec(safeDecode(v||"")); return m?o.decode(m[0]):null; };
  const readHash=()=>{ let preset=null, design=null;
    for(const part of safeDecode(location.hash.slice(1)).split("&")) if(part.startsWith("d=")) design=find(part.slice(2)); else if(o.isPreset(part)) preset=part;
    return {preset,design}; };
  const url=()=>{ const parts=[], p=o.preset(); if(p&&p!=="default"&&p!=="custom") parts.push(p); parts.push("d="+o.encode());
    return location.href.split("#")[0]+"#"+parts.join("&"); };
  const def=msg.textContent;
  const say=t=>{ msg.textContent=t; clearTimeout(say.t); say.t=setTimeout(()=>msg.textContent=def,4000); };
  // the async clipboard API needs permission some browsers withhold; fall back to the old copy command on a hidden textarea
  async function copy(text,done){ try{ await navigator.clipboard.writeText(text); return say(done); }catch(e){}
    const t=document.createElement("textarea"); t.value=text; t.setAttribute("readonly",""); t.style.cssText="position:fixed;opacity:0";
    document.body.append(t); t.select(); let ok=false; try{ ok=document.execCommand("copy"); }catch(e){} t.remove();
    say(ok?done:"Couldn't reach the clipboard. Copy the address bar instead; it always holds this design."); }
  $("dLink").onclick=()=>copy(url(),"Link copied.");
  $("dCopy").onclick=()=>copy(o.encode(),"Design code copied.");
  box.oninput=()=>{ const d=find(box.value); if(d){ o.apply(d); say(o.loaded?o.loaded(d)||"Design loaded.":"Design loaded."); } };
  box.onchange=()=>{ if(!find(box.value)) say(`That isn't a design code for this calculator. Codes here start with ${o.prefix}.`); box.value=o.encode(); };
  let live=false, timer=0;
  // onPreset(key) switches the pack preset and re-renders; apply(design) loads the design and re-renders
  addEventListener("hashchange",()=>{ const h=readHash(); if(h.preset&&o.onPreset) o.onPreset(h.preset); if(h.design) o.apply(h.design); });
  return {
    atLoad:readHash(),
    render(){ if(document.activeElement!==box) box.value=o.encode();
      // Debounced: Safari limits replaceState calls.
      if(live){ clearTimeout(timer); timer=setTimeout(()=>quietReplace(url()),400); } },
    live(){ live=true; },
    say,
  };
}
mdShare.b64u=b64u; mdShare.packBits=packBits; mdShare.unpackBits=unpackBits;
window.mdShare=mdShare;
})();
