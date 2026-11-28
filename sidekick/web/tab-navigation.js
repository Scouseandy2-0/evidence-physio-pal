// Scroll only the tab row; never move the document to reveal a selected tab.
export function setupScrollableTabs({tablist, selected, previous, next, controls, hint, ResizeObserverClass=globalThis.ResizeObserver}) {
  const max = () => Math.max(0,tablist.scrollWidth-tablist.clientWidth);
  const update = () => {
    const overflow=max()>1;
    controls.hidden=!overflow;hint.hidden=!overflow;
    if(overflow)tablist.setAttribute('aria-describedby',hint.id);else tablist.removeAttribute('aria-describedby');
    previous.disabled=tablist.scrollLeft<=1;next.disabled=tablist.scrollLeft>=max()-1;
  };
  const reveal = () => {
    if(tablist.clientWidth>0 && selected){
      const row=tablist.getBoundingClientRect(),item=selected.getBoundingClientRect();
      const delta=item.left<row.left?item.left-row.left:item.right>row.right?item.right-row.right:0;
      tablist.scrollLeft=Math.max(0,Math.min(max(),tablist.scrollLeft+delta));
    }
    update();
  };
  const earlier=()=>{tablist.scrollLeft=Math.max(0,tablist.scrollLeft-tablist.clientWidth*.75);update();};
  const later=()=>{tablist.scrollLeft=Math.min(max(),tablist.scrollLeft+tablist.clientWidth*.75);update();};
  previous.addEventListener('click',earlier);next.addEventListener('click',later);tablist.addEventListener('scroll',update,{passive:true});
  const observer=ResizeObserverClass?new ResizeObserverClass(reveal):null;observer?.observe(tablist);reveal();
  return ()=>{observer?.disconnect();previous.removeEventListener('click',earlier);next.removeEventListener('click',later);tablist.removeEventListener('scroll',update);};
}
