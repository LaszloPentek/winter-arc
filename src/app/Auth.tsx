import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/client";
import { createRedirectHandler, LINK_ERROR } from "../lib/authRedirect";
const completeRedirect = createRedirectHandler();
const Context = createContext<{
  session: Session | null;
  loading: boolean;
  authError: string;
}>({ session: null, loading: true, authError: "" });
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (alive) {
        setSession(s);
        setLoading(false);
      }
    });
    void completeRedirect(window.location.href,
      code => supabase!.auth.exchangeCodeForSession(code),
      url => { window.history.replaceState(null, "", url); window.dispatchEvent(new HashChangeEvent("hashchange")); })
      .then(() => supabase!.auth.getSession())
      .then(({ data, error }) => {
        if (alive) {
          setSession(data.session);
          setLoading(false);
          if (error)
            setAuthError("A munkamenet nem olvasható. Jelentkezz be újra.");
        }
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
          setAuthError(LINK_ERROR);
        }
      });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return (
    <Context.Provider value={{ session, loading, authError }}>
      {children}
    </Context.Provider>
  );
}
