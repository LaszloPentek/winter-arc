export function watchAppUpdate(container:ServiceWorkerContainer,url:string,onReady:()=>void,onError:()=>void,reload:()=>void) {
 let registration:ServiceWorkerRegistration|undefined;let stopped=false;let requested=false;
 const cleanups:(()=>void)[]=[];
 const inspect=()=>{if(!stopped&&registration?.waiting&&container.controller) onReady();};
 const changed=()=>{if(requested&&!stopped) reload();};
 container.addEventListener('controllerchange',changed);
 const check=()=>{if(!stopped&&navigator.onLine) void registration?.update().catch(()=>{});};
 const visible=()=>{if(document.visibilityState==='visible') check();};
 document.addEventListener('visibilitychange',visible);
 const interval=window.setInterval(check,60*60*1000);
 void container.register(url).then(r=>{
  if(stopped) return;
  registration=r;inspect();
  const installing=()=>{const worker=r.installing;if(!worker)return;const state=()=>{if(worker.state==='installed') inspect();};worker.addEventListener('statechange',state);cleanups.push(()=>worker.removeEventListener('statechange',state));};
  r.addEventListener('updatefound',installing);cleanups.push(()=>r.removeEventListener('updatefound',installing));installing();check();
 }).catch(()=>{if(!stopped)onError();});
 return {
  activate(){
   if(stopped)return;
   requested=true;
   if(registration?.waiting) registration.waiting.postMessage({type:'SKIP_WAITING'});
   else reload(); // Another tab may already have activated the waiting version.
  },
  stop(){stopped=true;window.clearInterval(interval);document.removeEventListener('visibilitychange',visible);container.removeEventListener('controllerchange',changed);cleanups.forEach(fn=>fn());},
 };
}
