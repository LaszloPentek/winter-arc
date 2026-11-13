# Állapot és következő lépések

## P0 — implementálva, éles elfogadás függőben
React/TypeScript/Vite/Tailwind; reszponzív design; Router; Supabase e-mailes OTP belépés és kijelentkezés; SQL-migrációk; RLS; baseline; napi mérések mentése/szerkesztése; Sanctuary; mérési előzmények; IndexedDB; idempotens mentési sor; verziókonfliktus; Realtime és célzott cache-frissítés.

A Supabase-projektet a felhasználó még nem hozta létre. Emiatt az igazi e-mailküldés, a hosztolt adatbázis és a telefon–PC elfogadási próba nincs kész. Ez az egyetlen oka, hogy P0 nem nevezhető élesben elfogadottnak. P1 nem kezdődött el.

## P1 — még nincs implementálva
Érzelemkerék, naptár, triggerek, detox, szokások, napló. Az energia/motiváció mezők már P0-ban megvannak. A navigáció későbbi funkciói jelölt információs oldalak.

## P2 — még nincs implementálva
Grafikonok, heti/havi bontások, műszak-összehasonlítás, heti reflexió, szabályalapú összefoglaló, Sanctuary Mode. Recharts függőség előkészítve, nincs kitalált statisztika.

## P3 — még nincs implementálva
Achievementek, szabálymotor, feloldások, saját trófeák és privát Storage. A Fenevad pszichológiai feltétele és az Expedition 33 dátumkorlátja később külön tesztelendő.

## P4 — alapok előkészítve, nincs teljesítve
Alkalmazáscache és PWA manifest; GitHub Actions workflow; alap offline sor. Hátravan: végleges PWA telepítési audit, offline szerkesztési UX bővítése, teljes JSON import/export, adattörlés/fióktörlés felület, teljes hozzáférhetőségi audit, éles GitHub Pages publikálás. A konfliktusmentés JSON-ja nem azonos a teljes fiókexporttal.
