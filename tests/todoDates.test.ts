import {expect,it} from 'vitest';
import {matchesTodo,type Todo} from '../src/features/quests/domain';
const task=(due_date:string|null,completed=false,archived=false):Todo=>({id:'a',title:'Olvasás',due_date,completed,archived,revision:1});
it('partitions due dates, includes overdue today, and crosses year boundaries',()=>{
 const day='2026-12-29';
 expect(matchesTodo(task('2026-12-28'),'today',day)).toBe(true);
 expect(matchesTodo(task(day),'today',day)).toBe(true);
 expect(matchesTodo(task('2027-01-05'),'upcoming',day)).toBe(true);
 expect(matchesTodo(task('2027-01-06'),'later',day)).toBe(true);
 expect(matchesTodo(task(null),'later',day)).toBe(true);
 expect(matchesTodo(task(null),'today',day)).toBe(false);
});
it('keeps completed and archived tasks out of active date views',()=>{
 for(const view of ['all','today','upcoming','later'] as const){expect(matchesTodo(task('2026-12-29',true),view,'2026-12-29')).toBe(false);expect(matchesTodo(task(null,false,true),view,'2026-12-29')).toBe(false);}
 expect(matchesTodo(task(null,true),'done','2026-12-29')).toBe(true);
 expect(matchesTodo(task(null,true,true),'done','2026-12-29')).toBe(false);
 expect(matchesTodo(task(null,true,true),'archive','2026-12-29')).toBe(true);
});
