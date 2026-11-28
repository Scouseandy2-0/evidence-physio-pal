import test from 'node:test';
import assert from 'node:assert/strict';
import {createNavigationDiagnostics,navigationRoute,formatNavigationDiagnostics} from '../web/navigation-diagnostics.js';
import {buildProblemReport} from '../web/help.js';
test('navigation diagnostics retain only fixed categories, never URLs, identifiers or private content',()=>{
 const log=createNavigationDiagnostics();
 log.record({kind:'activate',route:'#research',control:'paper-title',activation:'no-pointer-count',query:'private-query',title:'private-title',account:'private-account'});
 log.record({kind:'route',from:'https://private.invalid/?private-query#research',to:'#paper/123456'});
 log.record({kind:'activate',route:'#paper/123456',control:'paper-return',activation:'pointer-click'});
 log.record({kind:'route',from:'#paper/123456',to:'#research'});
 log.record({kind:'focus',route:'#research',control:'private-title'});
 const text=formatNavigationDiagnostics(log.snapshot());assert.match(text,/Activate paper-title on research \(no-pointer-count\)/);assert.match(text,/Page research → paper/);assert.match(text,/Activate paper-return on paper/);
 for(const secret of ['private-query','private-title','private-account','private.invalid','123456'])assert.ok(!text.includes(secret));
 assert.equal(navigationRoute('#paper/123456'),'paper');assert.equal(navigationRoute('https://private.invalid/?secret'),'unknown');
});
test('diagnostic history is bounded, independent between visits and cannot be changed through its snapshot',()=>{
 const log=createNavigationDiagnostics();for(let i=0;i<50;i++)log.record({kind:'focus',route:'#paper/123',control:'paper-heading'});
 assert.equal(log.snapshot().length,20);const copy=log.snapshot();copy[0].control='private';assert.equal(log.snapshot()[0].control,'paper-heading');
 assert.equal(createNavigationDiagnostics().snapshot().length,0);assert.match(formatNavigationDiagnostics(null),/No navigation observations/);
 assert.ok(!formatNavigationDiagnostics([{kind:'focus',route:'private',control:'private'}]).includes('private'));
});
test('problem reports sanitize supplied diagnostic context again and do not claim a click was definitely VoiceOver',()=>{
 const report=buildProblemReport({category:'accessibility',description:'Opening the record returned to results.'},{route:'paper',navigation:[{kind:'activate',route:'#paper/123',control:'paper-return',activation:'VoiceOver-private'},{kind:'route',from:'#paper/123',to:'#research',secret:'private'}]});
 assert.match(report,/Recent app navigation/);assert.match(report,/paper-return on paper \(unknown\)/);assert.match(report,/Page paper → research/);assert.doesNotMatch(report,/VoiceOver-private|#paper\/123|secret/);
});
