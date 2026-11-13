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
