// These are best-effort attempts. WorkspaceSync retains pending recovery data
// until a verified acknowledgement; browser suspension never implies success.
export function registerPendingSaveLifecycle({document,window,getSync}) {
  const flush=()=>{
    const sync=getSync();
    if(!sync?.account||!sync.pending||sync.invalidPending||sync.status==='conflict')return;
    void sync.flush();
  };
  const hidden=()=>{if(document.visibilityState==='hidden')flush();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',flush);
  return ()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',flush);};
}
