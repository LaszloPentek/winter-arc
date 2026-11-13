# Ellenőrzési jegyzőkönyv — P0

Ellenőrzés dátuma: 2026-11-13. Környezet: Windows, Node 24.22.1, a package-lock.json által rögzített csomagverziók.

| Ellenőrzés | Eredmény |
|---|---|
| TypeScript strict typecheck | Sikeres |
| ESLint | Sikeres, hiba nélkül |
| Vitest | 25 sikeres teszt, 5 tesztfájl |
| Ebből tényleges PostgreSQL/PGlite | 8 sikeres adatbázis- és RLS-teszt |
| Playwright | 6 sikeres desktop/mobil Chromium teszt |
| Vite production build | Sikeres |
| /winter-arc/ alútvonal és statikus assetek | Böngészőben sikeresen ellenőrizve |
| 320px mobilnézet | Dashboard, navigáció és űrlapok túlcsordulás nélkül |
| Production offline újratöltés | Service workerrel sikeres, előzetes online betöltés után |
| Böngészőhibák az alútvonalas próbában | Nem volt észlelt pageerror vagy hibás asset-válasz |
| npm audit --omit=dev | 0 ismert sérülékenység |
| Teljes npm audit | 4 alacsony súlyú jelzés; 0 közepes/magas/kritikus |

A 4 alacsony jelzés ugyanahhoz a fejlesztői lánchoz kötődik: deepmerge 4.3.1 → @rollup/plugin-node-resolve → workbox-build → vite-plugin-pwa. Az ellenőrzéskor a registry szerinti legfrissebb deepmerge is 4.3.1 volt. Nem alkalmaztunk ellenőrizetlen, törő visszaminősítést. A minimatch/glob közepes jelzéseit rögzített javított verzióval kezeltük; a build és lint ezután is sikeres. A függőségek állapota idővel változhat.

## Lefedett esetek
49 naptári nap, Budapest és nyári időszámítás, baseline ismételt létrehozása és meglévő értékének megőrzése, napi mentés és szerkesztés, napi egyediség, hiányzó adatok, pihenőnap tárolása, IndexedDB sor, hálózati hiba után megőrzés, visszaigazolás utáni törlés, verzióütközés, távolról törölt rekord ütközése, idempotens ismétlés, két felhasználó adatainak elkülönítése, anonim hozzáférés tiltása, közvetlen írás és user_id-hamisítás tiltása, fiókváltás közbeni mentési védelem, kitöltés megőrzése háttérfrissítéskor, alap navigáció és őszinte konfigurációs állapotok.

## Amit nem igazol ez a jegyzőkönyv
- Nem volt saját Supabase-projekt vagy hozzáférés; valódi e-mailes belépést és hosztolt RLS-t nem próbáltunk.
- Nem történt tényleges telefon–PC szinkronpróba, csak a helyi szinkronlogika és a SQL-szabályok ellenőrzése.
- A PGlite az auth.uid() értékét tesztkörnyezetben állítja be, nem ellenőriz Supabase JWT-aláírást.
- A mobilteszt Chromium-emuláció, nem fizikai iPhone/Safari teszt.
- Az offline próbában konfigurálatlan alkalmazáshéj indult; a teljes belépett offline életciklust saját Supabase-fiókkal még ellenőrizni kell.
- Nem történt teljes WCAG-audit, telefonos PWA-telepítés vagy GitHub Pages publikálás.
- A P1–P4 funkciókhoz tartozó tesztek későbbi feladatok; nem szerepelnek kész tesztként.

Az éles elfogadási lépések a README „Telefon–PC elfogadási próba” fejezetében találhatók.
