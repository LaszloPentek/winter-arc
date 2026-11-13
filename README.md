# WINTER ARC — The Quiet Season

Magyar nyelvű, személyes állapotkövető alkalmazás. **P0 alapverzió**, nem a teljes P0–P4 termék. A napi mérés, a privát adatmodell és a szinkronizáció kódja elkészült; a saját Supabase-projekt létrehozása és az éles két eszközös próba még szükséges. Nincs beépített kitalált mérési adat.

## Mi használható?
- Sanctuary főoldal, a 49 napos időszak haladásával (2026. november 13. – december 31.).
- Bejelentkezés e-mailes egyszer használatos linkkel, munkamenet, kijelentkezés.
- Naponként egy mérés: hangulat, stressz, alvásminőség, koncentráció; opcionális energia, motiváció, alvásidő, megjegyzés; műszak és pihenőnap.
- Korábbi napok szerkesztése és listája; külön, megőrzött baseline.
- Felhasználónként védett adatbázis; IndexedDB, offline mentési sor, újrapróbálás, verziókonfliktus-felület.
- Reszponzív mobil/desktop navigáció és eredeti SVG grafika.

A Quests és Journal navigációs pontok P1 jelöléssel későbbi funkciók. Az érzelemkerék, detox, grafikonok, trófeák, teljes export/import és fióktörlés felülete még nincs kész. Részletek: docs/ROADMAP.md.

## Helyi indítás
Ajánlott Node.js 24 LTS, npm. A telepítés Windows PowerShellből:

```powershell
cd 'D:\ai\winter arc'
npm ci
npm run dev
```

Nyisd meg a terminálban megjelenő helyi címet (általában http://127.0.0.1:5173). A projekt `inditas.ps1` fájlja a már telepített függőségekkel közvetlenül is indítja a Vite-ot. A buildet ne index.html fájlként nyisd meg: HTTP-szerver szükséges.

## Supabase beállítás — lépésről lépésre

1. Nyisd meg a https://supabase.com/dashboard oldalt, jelentkezz be és válaszd a **New project** lehetőséget. Válassz szervezetet, add meg a projekt nevét (például winter-arc), állíts be erős adatbázisjelszót, és válassz közeli európai régiót. Az adatbázisjelszót biztonságos jelszókezelőben tárold; nem kell a frontendbe.
2. Várd meg a projekt elkészültét. Nyisd meg az **SQL Editor** részt, hozz létre új lekérdezést, és másold bele a `supabase/migrations/202611130001_foundation.sql` teljes tartalmát. Futtasd. Ezután külön futtasd a `202611130002_realtime.sql` fájlt. Ezek egyszer futtatandó migrációk; ismételt kézi futtatáskor a már létező táblák hibát adnak. Ne törölj meglévő táblát a hiba elhárítására.
3. A projekt **Connect** vagy **Settings → API** részén keresd meg a **Project URL** és a **publishable key** értékét. Régebbi projektnél a nyilvános `anon` kulcs is használható. **Secret / service_role kulcsot soha ne adj meg a frontendben.**
4. A projektmappában másold a `.env.example` fájlt `.env.local` névre, majd töltsd ki:

```dotenv
VITE_SUPABASE_URL=https://SAJAT-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SAJAT_PUBLIKUS_KULCS
VITE_BASE_PATH=/
```

A példában szereplő értékek helyőrzők, nem működő hozzáférések. A `.env.local` kizárt a Gitből. A VITE_ változók belekerülnek a buildbe, ezért kizárólag nyilvános konfiguráció lehet bennük.

5. **Authentication → Sign In / Providers → Email** alatt legyen engedélyezett az e-mailes belépés. Az első belépőlink-kérés létrehozza a fiókot.
6. A gyári e-mail-sablon maradhat: az ingyenes projekt felületén a sablonszerkesztés saját SMTP vagy Pro nélkül zárolt. A program most a gyári belépőlinket fogadja PKCE-kódcserével. Nem szükséges saját magyar e-mail-sablon.
7. **Authentication → URL Configuration**: Site URL és engedélyezett Redirect URL helyben egyaránt `http://127.0.0.1:5173/`. Ezek a konkrét projekten már elmentve. Publikáláskor az éles HTTPS-cím és pontos alútvonal is szükséges. A callback a gyökér/alútvonal `?code=...` paraméterével érkezik, ezt egyszer váltjuk munkamenetre, majd eltávolítjuk a címsorból; a HashRouter ezután a fiókoldalt mutatja.
8. Nyisd meg a **Fiók és beállítások** oldalt a Brave-ben, kérj belépőlinket, majd ugyanabban a böngészőben nyisd meg a levél gombját. Ha a levelező másik böngészőben nyitja a linket, másold át a linket abba, amelyikben kérted. Másik eszközön külön kérj linket. Az alkalmazáson belüli böngésző és a Brave külön munkamenetnek számít. Ne küldd el a belépőlinket másnak.

A beépített levelező címzett- és küldési korlátai miatt elsőként a Supabase-fiókodhoz tartozó e-mail-címet használd. Lejárt linknél vagy hiányzó helyi PKCE-azonosítónál a felület új link kérését javasolja. Valódi e-mailküldés/belépés még felhasználói próba szükséges.

Hivatalos útmutatók: https://supabase.com/docs/guides/auth/auth-email-passwordless · https://supabase.com/docs/guides/auth/redirect-urls · https://supabase.com/docs/guides/database/postgres/row-level-security

## Telefon–PC elfogadási próba

Ezt csak a saját projekt bekötése után lehet hitelesen késznek jelölni.

1. PC-n lépj be, ments egy napi mérést, várd meg a **Mentve · felhővel egyeztetve** állapotot.
2. Telefonon ugyanazon HTTPS-címen, ugyanazzal az e-mail-címmel lépj be. Legyen látható ugyanaz a mérés. Módosítsd; PC-n Realtime vagy legfeljebb 30 másodperces lekérés frissítse. A Frissítés gomb is használható.
3. PC-n töltsd be az adatot, majd kapcsold ki a hálózatot. Módosítsd a mérést: csak helyi mentési visszajelzés jelenhet meg. Kapcsold vissza a kapcsolatot; a sor automatikusan elküldi.
4. Konfliktuspróba: PC offline módosít ugyanazt a napot, telefon online közben elment egy másik változatot. PC visszakapcsolásakor mindkét változat legyen látható; ne legyen automatikus felülírás. A választás JSON-biztonsági másolatot tölt le. A fájl érzékeny adatot tartalmaz, tartsd privát helyen.
5. Másik e-mail-fiókkal belépve az első fiók adatai ne jelenjenek meg. Kijelentkezés után a helyi cache törlődik; függő mentés mellett előbb rendezd a sort.

## GitHub Pages

A publikálás nincs elvégezve, nincs hozzá megadott GitHub-repository. A kód készen áll a Pages buildre.

1. Hozz létre repositoryt és töltsd fel a forrást. `.env.local`, node_modules, test-results és személyes JSON-mentések ne kerüljenek bele. A `dist` újraépül.
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → Variables** alatt add meg: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BASE_PATH`.
4. Normál projektoldalhoz base: `/REPOSITORY-NEVE/`; saját domainhez vagy felhasználói főoldalhoz `/`. A kezdő és záró perjel kötelező. A workflow alapértelmezésben a repository nevét használja.
5. **Actions → GitHub Pages publikálás → Run workflow**. A workflow tesztel és csak a dist mappát teszi közzé.
6. A kapott URL-t állítsd be Supabase Site URL-ként. Próbáld ki az e-mailes belépést, majd a fenti két eszközös listát.

A statikus klienskód publikus. A személyes adatok védelmét Supabase Auth/RLS adja, nem a repository titkossága. Saját domain esetén a DNS/CNAME beállítás a GitHub Pages útmutató szerint külön feladat.

## PWA és offline

A production build service workere kizárólag alkalmazásfájlokat cache-el. Első online megnyitás és cache-elés után az alkalmazás offline is indulhat. A Supabase-kérések nem kerülnek HTTP-cache-be. IndexedDB-ben a korábban belépett fiókhoz tartozó pillanatkép és sor marad; lejárt munkamenethez később újra be kell jelentkezni. Fejlesztői Vite alatt nincs service worker.

Mobilon az éles HTTPS-oldal böngészőmenüjében válaszd a telepítést vagy a főképernyőhöz adást. A konkrét telefonos telepítés és az összes offline életciklus P4-ben még külön ellenőrizendő. A PWA nem figyeli más alkalmazások használatát.

## Képek

A jelenlegi hegyvidék és ikon saját SVG. Trófeakép még nincs beépítve. A `public/achievements/README.md` rögzíti a később várt fájlokat. Személyes képet ne tegyél public alá: privát Supabase Storage-t csak P3-ban vezetünk be. A statikus képútvonalaknál `import.meta.env.BASE_URL` vagy a Vite által feldolgozott CSS-útvonal használatos.

## Ellenőrzések
```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

A PGlite teszt valódi PostgreSQL-ben futtatja a migrációkat, külön anon/authenticated szerepekkel. Nem helyettesíti a hosztolt Auth/Realtime és a telefon–PC tesztet. A Playwright alaptesztek konfigurálatlan környezetet feltételeznek; Supabase-változókat ne adj meg a CI ellenőrzési munkafolyamatban.

Futtatott eredmények és auditkorlátok: docs/VERIFICATION.md.

## Hibaelhárítás
- **npm nem található:** telepíts Node.js LTS-t, majd nyiss új PowerShellt. A jelenlegi gépen az inditas.ps1 a meglévő Codex Node futtatókörnyezetét is felismeri.
- **Felhőkapcsolat beállítandó:** ellenőrizd a .env.local nevét és a két VITE_SUPABASE_ változót, majd indítsd újra a fejlesztői szervert; publikált oldalt újra kell buildelni.
- **Szinkronizációs hiba:** hálózat, lejárt belépés, hiányzó migráció vagy RLS/RPC beállítás lehet az ok. A helyi sor megmarad. Előbb ellenőrizd a Supabase Auth és adatbázisnaplóit; ne töröld a böngésző adatait függő mentés mellett.
- **Nem érkezik e-mail:** spam mappa, SMTP, engedélyezett címek, Auth küldési limit, sablon Token mező.
- **Pages-en hiányoznak a képek:** VITE_BASE_PATH rossz; ellenőrizd a repository pontos nevét, majd új build/deploy.
- **Régi felület:** zárd be a többi lapot és nyisd újra; a PWA-frissítés a meglévő használat befejezése után aktiválódik.

## További dokumentáció
docs/ARCHITECTURE.md · docs/DATABASE.md · docs/DESIGN_SYSTEM.md · docs/ROADMAP.md · docs/SKILLS_AUDIT.md

## Saját borítókép (2026-11-13)
A megadott személyes kép `.private-assets/winter-cover.png` alatt marad, Gitből kizárva. A helyi Vite előnézet kizárólag loopback kapcsolaton szolgálja ki; a kép teljes aránnyal látszik a Sanctuary tetején. Nem került képgeneráló szolgáltatásba, public mappába vagy production buildbe. A publikált alkalmazás továbbra is az eredeti SVG-hátteret használja, amíg a privát Supabase Storage bekötése el nem készül. A személyes borító jelenleg nem szinkronizálódik más eszközökre.
