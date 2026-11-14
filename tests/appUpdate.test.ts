import {expect,it,vi} from 'vitest';
import {watchAppUpdate} from '../src/services/appUpdate';
it('announces a waiting update but reloads only after explicit activation',async()=>{
 const ready=vi.fn(),reload=vi.fn(),postMessage=vi.fn();
 const registration=Object.assign(new EventTarget(),{waiting:{postMessage},installing:null,update:vi.fn().mockResolvedValue(undefined)});
 const container=Object.assign(new EventTarget(),{controller:{},register:vi.fn().mockResolvedValue(registration)});
 const watcher=watchAppUpdate(container as unknown as ServiceWorkerContainer,'/winter-arc/sw.js',ready,vi.fn(),reload);
 await Promise.resolve();expect(ready).toHaveBeenCalledTimes(1);
 container.dispatchEvent(new Event('controllerchange'));expect(reload).not.toHaveBeenCalled();expect(postMessage).not.toHaveBeenCalled();
 watcher.activate();expect(postMessage).toHaveBeenCalledWith({type:'SKIP_WAITING'});
 container.dispatchEvent(new Event('controllerchange'));expect(reload).toHaveBeenCalledTimes(1);
 watcher.stop();container.dispatchEvent(new Event('controllerchange'));expect(reload).toHaveBeenCalledTimes(1);
});
it('does not advertise first installation as an update',async()=>{
 const registration=Object.assign(new EventTarget(),{waiting:{},installing:null,update:vi.fn().mockResolvedValue(undefined)});
 const container=Object.assign(new EventTarget(),{controller:null,register:vi.fn().mockResolvedValue(registration)});
 const ready=vi.fn();const watcher=watchAppUpdate(container as unknown as ServiceWorkerContainer,'/sw.js',ready,vi.fn(),vi.fn());
 await Promise.resolve();expect(ready).not.toHaveBeenCalled();watcher.stop();
});
