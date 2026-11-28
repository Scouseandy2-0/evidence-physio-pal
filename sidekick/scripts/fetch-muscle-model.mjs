import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file=new URL('../web/muscles.glb',import.meta.url);
const valid=bytes=>bytes.length===5624592 && createHash('sha256').update(bytes).digest('hex')==='615ed2cf0d5ca9aa63f30bb806a65c740ed2ab057463a19505e19eff2bf207ce';
if(existsSync(file)){if(!valid(readFileSync(file)))throw new Error('Muscle model checksum mismatch; restore the pinned source asset.');}
else{
 const response=await fetch('https://raw.githubusercontent.com/organui/muscles-3d/1c746c36d12a78c5f3fd452dbe5d29ae869cad04/public/models/muscles.glb',{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error('Could not download the pinned muscle model.');
 const bytes=Buffer.from(await response.arrayBuffer());if(!valid(bytes))throw new Error('Downloaded muscle model checksum mismatch.');
 const temporary=new URL('../web/muscles.glb.download',import.meta.url);writeFileSync(temporary,bytes);renameSync(temporary,file);
}
