import { beforeEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({getSession:vi.fn(),rpc:vi.fn(),setHeader:vi.fn()}));
vi.mock('../src/services/client',()=>({supabase:{auth:{getSession:mocks.getSession},rpc:mocks.rpc}}));
import { sendPending } from '../src/services/remote';
import type { Pending } from '../src/services/local';
const pending:Pending={id:'op',user:'owner-a',expected:0,data:{day:'2026-01-01',mood:4,stress:7,sleep:7,focus:5,energy:null,motivation:null,note:'Privát',shift:'rest',sleep_hours:null,rest_day:true}};
beforeEach(()=>{vi.resetAllMocks();mocks.rpc.mockReturnValue({setHeader:mocks.setHeader});mocks.setHeader.mockResolvedValue({data:{status:'saved',row:{}},error:null});});
it('never sends an old queue under a different signed-in account',async()=>{mocks.getSession.mockResolvedValue({data:{session:{user:{id:'owner-b'},access_token:'token-b'}},error:null});await expect(sendPending(pending)).rejects.toThrow();expect(mocks.rpc).not.toHaveBeenCalled();});
it('pins the owner token for the complete RPC even if the active account changes',async()=>{mocks.getSession.mockResolvedValue({data:{session:{user:{id:'owner-a'},access_token:'token-a'}},error:null});await sendPending(pending);expect(mocks.setHeader).toHaveBeenCalledWith('Authorization','Bearer token-a');});
