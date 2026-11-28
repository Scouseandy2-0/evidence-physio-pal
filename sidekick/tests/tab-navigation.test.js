import test from 'node:test';
import assert from 'node:assert/strict';
import {setupScrollableTabs} from '../web/tab-navigation.js';
function fixture(width=300,total=900){
 const tablist=Object.assign(new EventTarget(),{scrollLeft:0,clientWidth:width,scrollWidth:total,getBoundingClientRect:()=>({left:10,right:10+tablist.clientWidth}),setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}});
 const selected={getBoundingClientRect:()=>({left:700-tablist.scrollLeft,right:850-tablist.scrollLeft})};
 const previous=new EventTarget(),next=new EventTarget(),controls={},hint={id:'hint'};
 return {tablist,selected,previous,next,controls,hint,ResizeObserverClass:null};
}
test('selected learning tab is revealed inside the row and explicit controls expose overflow with correct end states',()=>{
 const x=fixture(),cleanup=setupScrollableTabs(x);assert.equal(x.tablist.scrollLeft,540);assert.equal(x.hint.hidden,false);assert.equal(x.controls.hidden,false);assert.equal(x.tablist['aria-describedby'],'hint');
 x.next.dispatchEvent(new Event('click'));assert.equal(x.tablist.scrollLeft,600);assert.equal(x.next.disabled,true);assert.equal(x.previous.disabled,false);
 x.previous.dispatchEvent(new Event('click'));assert.equal(x.tablist.scrollLeft,375);assert.equal(x.next.disabled,false);
 cleanup();x.next.dispatchEvent(new Event('click'));assert.equal(x.tablist.scrollLeft,375);
});
test('non-overflowing rows hide redundant hints and controls and remove their description',()=>{
 const x=fixture(900,900);setupScrollableTabs(x);assert.equal(x.controls.hidden,true);assert.equal(x.hint.hidden,true);assert.equal(x.tablist['aria-describedby'],undefined);
});
test('resize rechecks selected-tab visibility and observer cleanup disconnects',()=>{
 const x=fixture();let observer;
 x.ResizeObserverClass=class{constructor(cb){this.cb=cb;observer=this;}observe(el){assert.equal(el,x.tablist);}disconnect(){this.closed=true;}};
 const cleanup=setupScrollableTabs(x);x.tablist.clientWidth=200;observer.cb();assert.equal(x.tablist.scrollLeft,640);cleanup();assert.equal(observer.closed,true);
});
