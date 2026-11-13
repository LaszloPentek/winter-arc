import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi, beforeEach } from "vitest";
const mocks=vi.hoisted(()=>({send:vi.fn()}));
vi.mock("../src/services/client",()=>({configured:true,supabase:{auth:{signInWithOtp:mocks.send}}}));
import { Settings } from "../src/features/settings/Settings";
beforeEach(()=>vi.resetAllMocks());
it("requests a magic link with a same-origin callback and no code field",async()=>{
 mocks.send.mockResolvedValue({error:null}); const user=userEvent.setup();
 render(<Settings session={null} pendingCount={0} onLogout={()=>{}}/>);
 await user.type(screen.getByLabelText("E-mail-cím"),"example@example.com");
 await user.click(screen.getByRole("button",{name:"Belépőlink kérése"}));
 expect(mocks.send).toHaveBeenCalledWith({email:"example@example.com",options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+"/"}});
 expect(await screen.findByText(/Elküldtük a belépőlinket/)).toBeVisible();
 expect(screen.queryByLabelText("Belépőkód")).toBeNull();
});
it("does not claim mail delivery after a rejected request",async()=>{
 mocks.send.mockResolvedValue({error:{message:"rate limit"}});const user=userEvent.setup();
 render(<Settings session={null} pendingCount={0} onLogout={()=>{}}/>);
 await user.type(screen.getByLabelText("E-mail-cím"),"example@example.com");
 await user.click(screen.getByRole("button",{name:"Belépőlink kérése"}));
 expect(await screen.findByText(/Nem sikerült belépőlinket küldeni/)).toBeVisible();
 expect(screen.queryByText(/Elküldtük a belépőlinket/)).toBeNull();
});
