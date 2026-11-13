import {render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {RitualForm} from "../src/features/checkin/Ritual";
it("sets an explicit mood score from a card and allows exact adjustment",async()=>{
 const save=vi.fn().mockResolvedValue(undefined);const user=userEvent.setup();
 render(<RitualForm date="2026-01-01" disabled={false} onSave={save}/>);
 expect(screen.getAllByRole("radio").every(r=>!(r as HTMLInputElement).checked)).toBe(true);
 await user.click(screen.getByRole("radio",{name:/Megvagyok/}));
 expect(screen.getByLabelText("Hangulat")).toHaveValue("5");
 await user.selectOptions(screen.getByLabelText("Hangulat"),"6");
 expect(screen.getByRole("radio",{name:/Megvagyok/})).toBeChecked();
 for(const label of ["Stressz","Alvásminőség","Koncentráció"]) await user.selectOptions(screen.getByLabelText(label),"7");
 await user.click(screen.getByRole("button",{name:"Napi mérés mentése"}));
 expect(save).toHaveBeenCalledWith(expect.objectContaining({mood:6}),0);
});
it("prevents mood changes when the form is disabled",()=>{
 render(<RitualForm date="2026-01-01" disabled onSave={vi.fn()}/>);
 expect(screen.getByRole("radio",{name:/Nagyon jól/})).toBeDisabled();
});
