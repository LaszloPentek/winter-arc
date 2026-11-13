import { expect, it } from "vitest";
import { validateCover } from "../src/services/cover";
it("rejects active formats and oversized images",()=>{
 expect(()=>validateCover(new File(["<svg/>"],"x.svg",{type:"image/svg+xml"}))).toThrow();
 expect(()=>validateCover(new File([new Uint8Array(5242881)],"x.png",{type:"image/png"}))).toThrow();
 expect(()=>validateCover(new File(["test"],"x.png",{type:"image/png"}))).not.toThrow();
});
