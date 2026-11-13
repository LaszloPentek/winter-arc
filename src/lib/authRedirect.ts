export const LINK_ERROR = "A belépőlink lejárt, már felhasználtad, vagy másik böngészőben nyitottad meg. Kérj új linket, és ugyanabban a böngészőben nyisd meg, ahol kérted.";

// PKCE codes are exchanged once, never interpreted as router paths or logged.
export function createRedirectHandler() {
  let pending: Promise<void> | undefined;
  return (href: string, exchange: (code: string) => Promise<{ error: unknown }>, replace: (url: string) => void): Promise<void> => {
    if (pending) return pending;
    const url = new URL(href);
    const fragment = new URLSearchParams(url.hash.slice(1));
    const failed = url.searchParams.has("error") || fragment.has("error");
    const code = url.searchParams.get("code");
    if (!failed && !code) return Promise.resolve();
    for (const key of ["code", "error", "error_code", "error_description"]) url.searchParams.delete(key);
    url.hash = "/settings";
    replace(url.pathname + url.search + url.hash);
    pending = (async () => {
      if (failed || !code) throw new Error(LINK_ERROR);
      try {
        const result = await exchange(code);
        if (result.error) throw new Error(LINK_ERROR);
      } catch { throw new Error(LINK_ERROR); }
    })();
    return pending;
  };
}
export function authReturnUrl(origin: string, base: string) {
  return new URL(base, origin).href;
}
