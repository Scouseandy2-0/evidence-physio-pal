import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file=new URL('../web/skeleton.glb',import.meta.url);
const expected='c68b05d97d70c4d33363bf71d9885c191eb25f61a82dbba935a726ddd8e60ac8';
const valid=bytes=>bytes.length===5221116 && createHash('sha256').update(bytes).digest('hex')===expected;
if(existsSync(file)) { if(!valid(readFileSync(file))) throw new Error('Anatomy model checksum mismatch; restore the pinned source asset.'); }
else {
  const response=await fetch('https://raw.githubusercontent.com/organui/skeleton-3d/120fc17278559057b37aff516eee89d263b604c6/public/models/skeleton.glb',{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error('Could not download the pinned anatomy model.');
  const bytes=Buffer.from(await response.arrayBuffer());if(!valid(bytes))throw new Error('Downloaded anatomy model checksum mismatch.');
  const temporary=new URL('../web/skeleton.glb.download',import.meta.url);writeFileSync(temporary,bytes);renameSync(temporary,file);
}
