# P0 architektúra

## Határok
React + TypeScript strict, Vite, Tailwind. HashRouter: a GitHub Pages mélylinkjei nem igényelnek szerveroldali útvonalkezelést. Supabase Auth: e-mailes belépőlink, PKCE. A ?code callback egyszeri feldolgozása és címsorból törlése külön történik, utána a HashRouter fiókoldala látszik. A linket ugyanabban a böngészőben kell megnyitni, ahol kérték. TanStack Query: fiókonkénti szervercache; IndexedDB: fiókonként elkülönített helyi pillanatkép és tartós mentési sor. Supabase PostgreSQL: az igazság forrása.

## Mentés
1. Zod ellenőrzi a bemenetet, az alap négy mutató kötelező. A többi mérés null lehet.
2. A helyi IndexedDB tranzakció commitja után látható a helyi mentés visszaigazolása.
3. A sor eleme UUID műveletazonosítót, elvárt szerververziót és teljes adatot tartalmaz.
4. Az RPC tranzakción belül felhasználónként zárol, ellenőrzi a verziót, ment és visszaigazol. Ugyanazon művelet újraküldése ugyanazt az eredményt adja.
5. A helyi sor csak a visszaigazolás után ürül. Hálózati hiba esetén megmarad; online esemény, fókusz, 30 másodperces időzítő vagy kézi újrapróbálás indítja a következő kísérletet.
6. Realtime esemény és 30 másodperces lekérés frissíti a másik eszközt.

## Ütközés
A várt és aktuális verzió eltérése kétváltozatos összehasonlító felülethez vezet. A háttérfolyamat nem ír felül. Döntéskor mindkét verzió JSON-fájlba exportálódik; a helyi változat megtartása új verzióellenőrzéses mentés. A felülírt szerverváltozat a checkin_versions táblában marad. Amíg egy adott nap mentése függőben van, arra a napra új módosítás nem készíthető. Ez tudatos P0 korlát.

## Adatvédelem
Nincs analitika, harmadik féltől betöltött font vagy külső kép. React szövegként rendereli a megjegyzéseket. Személyes adat nem kerül service worker HTTP-cache-be; csak alkalmazásfájlok. Az IndexedDB és a böngészőben tárolt munkamenet nem végpontok között titkosított tároló: saját, jelszóval védett eszköz szükséges. Kijelentkezés a helyi fiókcache-t törli, de függő módosítás esetén előbb rendezni kell a sort. Új fióknál az alkalmazás adatállapota újramountolódik.

## Fájlok
- src/app: munkamenet, navigáció, alkalmazásváz
- src/features: dashboard, check-in, beállítások
- src/services: Supabase, IndexedDB, szinkron
- src/lib: dátumok, validáció, alaptípusok
- supabase/migrations: sémák, RLS, RPC-k
- tests: domain, űrlap, offline sor, valódi SQL a PGlite PostgreSQL motorban, Playwright

## Következő bővítések
P1: érzelmek, naptár, trigger, detox, szokások, napló. P2: Recharts, heti reflexiók, összefoglaló és Sanctuary Mode. P3: determinisztikus trófeaszabályok és privát Storage. P4: teljes export/import, törlés, PWA telepíthetőség és offline UX véglegesítése. Nem hozunk létre üres táblákat működő funkciók látszatáért.
