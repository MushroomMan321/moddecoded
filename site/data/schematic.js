/* Schematic download for the calculators: a vanilla structure file (gzipped NBT), which Create's Schematic Table,
   Litematica and structure blocks all load.

   Page markup: a <select> for the Minecraft version and a download button.
   Usage:
     mdSchematic.versionPicker(select, "mek-tank-mc")   -> fills the select and remembers the choice in localStorage
     mdSchematic.dataVersion(select)                    -> [version, DataVersion] for the chosen version
     mdSchematic.canGzip                                -> false in browsers without CompressionStream
     await mdSchematic.download(structure, "name.nbt")  -> structure is {DataVersion, size, palette, blocks, entities};
                                                           a block may carry nbt:{id, ...} for its block entity
   Block IDs for Mekanism are the same from 10.2 (1.18.2) to 10.7 (1.21.1); only DataVersion changes. */
(function(){
"use strict";
const VERSIONS=[["1.21.1",3955],["1.20.1",3465],["1.19.2",3120],["1.18.2",2975]];
// numbers are TAG_Int, strings TAG_String, Int32Arrays TAG_Int_Array (block entity data), arrays TAG_List, objects TAG_Compound
function encodeNbt(root){
  const out=[], te=new TextEncoder(), u8=v=>out.push(v&255), i16=v=>{ u8(v>>8); u8(v); }, i32=v=>{ u8(v>>>24); u8(v>>>16); u8(v>>>8); u8(v); };
  const str=s=>{ const b=te.encode(s); i16(b.length); for(const x of b) out.push(x); };
  const type=v=>typeof v==="number"?3:typeof v==="string"?8:v instanceof Int32Array?11:Array.isArray(v)?9:10;
  const put=v=>{ const t=type(v);
    if(t===3) i32(v); else if(t===8) str(v); else if(t===11){ i32(v.length); v.forEach(i32); }
    else if(t===9){ u8(v.length?type(v[0]):0); i32(v.length); v.forEach(put); }
    else { for(const k in v){ u8(type(v[k])); str(k); put(v[k]); } u8(0); } };
  u8(10); str(""); put(root); return new Uint8Array(out);
}
async function download(structure,name){
  const blob=await new Response(new Blob([encodeNbt(structure)]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.append(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),10000);
}
function versionPicker(select,key){
  for(const [v] of VERSIONS){ const o=document.createElement("option"); o.value=o.textContent=v; select.append(o); }
  try{ const v=localStorage.getItem(key); if(VERSIONS.some(m=>m[0]===v)) select.value=v; }catch(e){}
  select.addEventListener("change",()=>{ try{ localStorage.setItem(key,select.value); }catch(e){} });
}
window.mdSchematic={
  versions:VERSIONS, encodeNbt, download, versionPicker,
  dataVersion:select=>VERSIONS.find(v=>v[0]===select.value)||VERSIONS[0],
  canGzip:typeof CompressionStream==="function",
};
})();
