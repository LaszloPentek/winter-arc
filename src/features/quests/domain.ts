export type Todo={id:string;title:string;completed:boolean;archived:boolean;revision:number;due_date:string|null};
export const todoViews=[['all','Aktív'],['today','Ma'],['upcoming','Közelgő'],['later','Később'],['done','Kész'],['archive','Archívum']] as const;
export type TodoView=typeof todoViews[number][0];
export function weekEnd(day:string) {const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+7);return d.toISOString().slice(0,10);}
export function matchesTodo(t:Todo,view:TodoView,day:string) {
 if(view==='archive') return t.archived;
 if(t.archived) return false;
 if(view==='done') return t.completed;
 if(t.completed) return false;
 if(view==='all') return true;
 if(view==='today') return !!t.due_date&&t.due_date<=day;
 if(view==='upcoming') return !!t.due_date&&t.due_date>day&&t.due_date<=weekEnd(day);
 return !t.due_date||t.due_date>weekEnd(day);
}
