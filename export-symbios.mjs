import fs from 'node:fs/promises';
import {characters,buildCharacter} from './symbios-models.mjs';
import {GLTFExporter} from './vendor/three/examples/jsm/exporters/GLTFExporter.js';
globalThis.FileReader=class{
  readAsArrayBuffer(blob){blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();});}
  readAsDataURL(blob){blob.arrayBuffer().then(v=>{this.result='data:application/octet-stream;base64,'+Buffer.from(v).toString('base64');this.onloadend?.();});}
};
await fs.mkdir('models/symbios',{recursive:true});
for(const character of characters){
 const model=buildCharacter(character);
 const bytes=await new GLTFExporter().parseAsync(model,{binary:true});
 await fs.writeFile(`models/symbios/${character.id}.glb`,Buffer.from(bytes));
 console.log(character.id,bytes.byteLength);
}
