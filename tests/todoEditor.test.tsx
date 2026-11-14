import {render,screen,fireEvent} from '@testing-library/react';
import {expect,it,vi} from 'vitest';
import {TodoEditor} from '../src/features/quests/TodoEditor';
it('preserves the local draft when a newer cloud revision arrives and requires explicit overwrite',()=>{
 const original={id:'a',title:'Régi',due_date:null,completed:false,archived:false,revision:1};const save=vi.fn().mockResolvedValue(undefined);
 const {rerender}=render(<TodoEditor original={original} current={original} busy={false} onSave={save} onCancel={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Megnevezés'),{target:{value:'Saját szöveg'}});
 const current={...original,title:'Másik eszköz',due_date:'2026-12-01',revision:2};
 rerender(<TodoEditor original={original} current={current} busy={false} onSave={save} onCancel={()=>{}}/>);
 expect(screen.getByLabelText('Megnevezés')).toHaveValue('Saját szöveg');expect(screen.getByText('Másik eszköz')).toBeInTheDocument();expect(save).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Saját szöveg és határidő mentése a friss változatra'}));
 expect(save).toHaveBeenCalledWith('Saját szöveg','',2);
});
