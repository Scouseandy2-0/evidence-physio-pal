import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
const root='node_modules';const notices=[];
// Include installed dependency licences; generated exports themselves are user records.
for(const name of readdirSync(root).flatMap(n=>n.startsWith('@')?readdirSync(`${root}/${n}`).map(c=>`${n}/${c}`):[n])){
 const directory=`${root}/${name}`,manifest=`${directory}/package.json`;
 if(!existsSync(manifest))continue;
 const pkg=JSON.parse(readFileSync(manifest,'utf8'));
 const licences=readdirSync(directory).filter(n=>/^(licen[cs]e|copying|notice)(\.|$)/i.test(n));
 if(licences.length)notices.push(`${name} ${pkg.version} (${pkg.license || 'see licence'})\n${licences.map(file=>readFileSync(`${directory}/${file}`,'utf8')).join('\n')}`);
}
const fontLicence=readFileSync('docs/roboto-license.txt','utf8');
writeFileSync('web/export-third-party.txt',`PhysioSidekick export software and font notices\n\nPDF: pdfmake with bundled Roboto fonts. Word: docx. These licences apply to software/fonts, not ownership of your learning notes. Additional installed dependency notices are included for completeness.\n\n${notices.join('\n\n----------------------------------------\n\n')}\n\nRoboto fonts\n${fontLicence}`);
