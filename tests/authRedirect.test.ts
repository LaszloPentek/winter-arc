import { expect, it, vi } from "vitest";
import { createRedirectHandler, authReturnUrl, LINK_ERROR } from "../src/lib/authRedirect";
it("exchanges a callback only once even during StrictMode replay", async () => {
 const handle=createRedirectHandler(), exchange=vi.fn().mockResolvedValue({error:null}), replace=vi.fn();
 await Promise.all([handle("https://example.com/winter-arc/?code=sample",exchange,replace),handle("https://example.com/winter-arc/?code=sample",exchange,replace)]);
 expect(exchange).toHaveBeenCalledTimes(1); expect(replace).toHaveBeenCalledWith("/winter-arc/#/settings");
});
it("ordinary router navigation is not an auth callback", async()=>{
 const exchange=vi.fn(), replace=vi.fn(); await createRedirectHandler()("https://example.com/#/ritual",exchange,replace);
 expect(exchange).not.toHaveBeenCalled(); expect(replace).not.toHaveBeenCalled();
});
it("scrubs expired-link error details without echoing them", async()=>{
 const exchange=vi.fn(),replace=vi.fn();
 await expect(createRedirectHandler()("https://example.com/#error=access_denied&error_description=private",exchange,replace)).rejects.toThrow(LINK_ERROR);
 expect(exchange).not.toHaveBeenCalled();expect(replace).toHaveBeenCalledWith("/#/settings");
});
it("reports missing PKCE verifier or rejected exchange as a new-link action",async()=>{
 await expect(createRedirectHandler()("https://example.com/?code=sample",vi.fn().mockResolvedValue({error:new Error("private")}),vi.fn())).rejects.toThrow(LINK_ERROR);
});
it("handles transport failures without leaking callback values",async()=>{
 await expect(createRedirectHandler()("https://example.com/?code=sample",vi.fn().mockRejectedValue(new Error("internal")),vi.fn())).rejects.toThrow(LINK_ERROR);
});
it("keeps the configured Pages base and excludes router fragments",()=>{
 expect(authReturnUrl("https://example.com","/winter-arc/")).toBe("https://example.com/winter-arc/");
 expect(authReturnUrl("http://127.0.0.1:5173","/")).toBe("http://127.0.0.1:5173/");
});
