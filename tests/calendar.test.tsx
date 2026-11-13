import {render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from "react-router-dom";
import {expect,it,vi} from "vitest";
import {MoodCalendar} from "../src/features/calendar/MoodCalendar";
import {today} from "../src/lib/domain";
it("distinguishes missing days and opens the chosen day",async()=>{
 const select=vi.fn();const user=userEvent.setup();
 render(<MemoryRouter><MoodCalendar rows={[]} pending={[]} onSelect={select}/></MemoryRouter>);
 await user.click(screen.getByRole("button",{name:`${today()}: nincs mérés`}));
 expect(screen.getByText("Ehhez a naphoz még nincs mérés.")).toBeVisible();
 await user.click(screen.getByRole("link",{name:"Mérés rögzítése"}));expect(select).toHaveBeenCalledWith(today());
});
it("switches between month and seven-day week without inventing records",async()=>{
 const user=userEvent.setup();render(<MemoryRouter><MoodCalendar rows={[]} pending={[]} onSelect={()=>{}}/></MemoryRouter>);
 expect(screen.getAllByRole("button",{name:/nincs mérés/}).length).toBeGreaterThan(27);
 await user.click(screen.getByRole("button",{name:"Heti"}));expect(screen.getAllByRole("button",{name:/nincs mérés/})).toHaveLength(7);
 await user.click(screen.getByRole("button",{name:"Előző időszak"}));expect(screen.getAllByRole("button",{name:/nincs mérés/})).toHaveLength(7);
});
