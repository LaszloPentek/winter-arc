# Állapot és következő lépések

## P0 — éles alapok működnek
React/TypeScript/Vite/Tailwind; reszponzív design; Router; Supabase e-mailes OTP belépés és kijelentkezés; SQL-migrációk; RLS; baseline; napi mérések mentése/szerkesztése; Sanctuary; mérési előzmények; IndexedDB; idempotens mentési sor; verziókonfliktus; Realtime és célzott cache-frissítés.

A Supabase és GitHub Pages beállítva. A felhasználó visszajelzése szerint a belépés, mentés, többeszközös használat és saját borító működik. A teljes offline/konfliktus elfogadási lista továbbra is ellenőrzendő.

## P1 — megkezdve
Elkészült a Chronicle havi/heti hangulatnaptára, mentett és függő napi értékekkel, napi részletekkel és a mérés megnyitásával. A hiányzó nap nem nulla pont. Érzelemszűrés az érzelemrögzítés után kerül bele.
Hátravan: érzelemkerék, kiváltó okok, detox, szokások és napló. Az energia/motiváció mezők már P0-ban megvannak.

## P2 — még nincs implementálva
Grafikonok, heti/havi bontások, műszak-összehasonlítás, heti reflexió, szabályalapú összefoglaló, Sanctuary Mode. Recharts függőség előkészítve, nincs kitalált statisztika.

## P3 — még nincs implementálva
Achievementek, szabálymotor, feloldások, saját trófeák és privát Storage. A Fenevad pszichológiai feltétele és az Expedition 33 dátumkorlátja később külön tesztelendő.

## P4 — alapok előkészítve, nincs teljesítve
Alkalmazáscache és PWA manifest; GitHub Actions workflow; alap offline sor. Hátravan: végleges PWA telepítési audit, offline szerkesztési UX bővítése, teljes JSON import/export, adattörlés/fióktörlés felület, teljes hozzáférhetőségi audit, éles GitHub Pages publikálás. A konfliktusmentés JSON-ja nem azonos a teljes fiókexporttal.

## 2026-11-13 – XP és teendők
Elkészült a Quests teendőlista: hozzáadás, teljesítés/visszanyitás, archiválás/visszaállítás. Online mentés, tulajdonosi RLS, verzióellenőrzés. Jelenleg nincs offline teendőmódosítás vagy határidő/ismétlődés. A napi mérés első mentése 10 XP, a teendő első teljesítése 20 XP; 100 XP/szint; nincs levonás. Az újrapipálás nem ad új XP-t. Az XP-jutalmakat a szerver állítja elő. A 004 migráció az éles Supabase-ben alkalmazva.
Az ötkártyás hangulatválasztó szintén elkészült; a részletes érzelmek és kiváltó okok még hátravannak.
A P3 privát Storage része a saját borítóhoz már működik; a trófeák még nincsenek kész. A P4 GitHub Pages publikálása már működik. Az automatikus frissítésjelzés még hátravan.
A Health Connect megvalósítási terv: HEALTH_CONNECT.md. Ez még nem működő szinkron.

## 2026-11-14: teendők és alkalmazásfrissítés

- Teendők címének és opcionális határidejének szerkesztése, verzióütközésnél a saját, eredeti és felhőváltozat megőrzésével.
- Ma (lejártakkal), Közelgő (következő 7 nap), Később (távolabbi és dátum nélküli), valamint Kész és Archívum nézet.
- Szerkesztés nem ad új XP-t. Az eredeti teljesítési és archiválási műveletek változatlanok.
- Az új service worker kézi, mentésre figyelmeztető frissítésjelzést kap; másik lap aktiválása nem tölt újra automatikusan.
- Telepítési sorrend: előbb `supabase/migrations/202611140005_todo_details.sql` a Supabase SQL Editorban, utána a webalkalmazás publikálása. A migráció régi kliensekkel kompatibilis.
- Ismétlődő teendők és offline teendőmentési sor még nincs ebben a csomagban.
