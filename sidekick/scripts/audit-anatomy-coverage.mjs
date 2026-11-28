import {writeFileSync} from 'node:fs';
import {anatomyInventory,anatomyInventorySummary,anatomyInventoryCSV} from '../web/anatomy-inventory.js';
const rows=anatomyInventory(),checkedAt=new Date().toISOString(),date=checkedAt.slice(0,10);
const report={checkedAt,scope:'Audit of imported selectable catalogue and authored draft references. Not a complete whole-body anatomical inventory, a count of individual-side muscles/bones, or independent anatomical approval.',summary:anatomyInventorySummary(rows),structures:rows};
writeFileSync(`docs/anatomy-selection-inventory-${date}.json`,JSON.stringify(report,null,2)+'\n');
writeFileSync(`docs/anatomy-selection-inventory-${date}.csv`,anatomyInventoryCSV(rows));
console.log(JSON.stringify({scope:report.scope,summary:report.summary}));
