// Run with Node 22+: node tools/export-avatar.mjs
import { writeFile } from 'node:fs/promises';
import { createSomilAvatar } from '../scripts/avatar-model.js';
import { GLTFExporter } from '../scripts/vendor/GLTFExporter.js';

// GLTFExporter uses the browser FileReader API for its final binary Blob.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result=result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result=`data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};
const {avatar}=createSomilAvatar();
let meshes=0,vertices=0;
avatar.traverse(obj=>{
  if(!obj.isMesh)return;
  meshes++;vertices+=obj.geometry.attributes.position.count;
  for(const attribute of Object.values(obj.geometry.attributes)){
    if(!Array.from(attribute.array).every(Number.isFinite))throw new Error(`Non-finite geometry in ${obj.name}`);
  }
});
const data=await new GLTFExporter().parseAsync(avatar,{binary:true});
await writeFile(new URL('../models/somil-avatar.glb',import.meta.url),Buffer.from(data));
console.log(`Exported ${meshes} meshes, ${vertices} vertices; ${data.byteLength} bytes.`);
