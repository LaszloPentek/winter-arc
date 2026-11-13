# Health Connect kapcsolat – megvalósítási terv

Állapot: megvalósítható Androidos kapcsolaton keresztül; a webes Winter Arcban még nincs bekapcsolva, egészségadatot nem importáltunk.

A felhasználó Samsung Healthből lépéseket, alvást, edzéseket és pulzust kért. A Wim Hof Android appban a felhasználó visszajelzése szerint elérhető Health Connect.

## Adatút
Samsung Health / Wim Hof → Health Connect a telefonon → Winter Arc Androidos kísérőalkalmazás → saját Supabase-fiók → webes Winter Arc.

A weboldal és a telepített PWA önmagában nem fér hozzá az Android Health Connect SDK-hoz. Az Androidos részhez külön fordítás, telepítés és telefonos próba szükséges. A jelenlegi gépen nem található Android SDK, adb vagy Java a PATH-on.

## Első változat
- Kézzel indított, előtérben végzett szinkron, utolsó sikeres frissítés jelzése.
- Külön kérhető olvasási engedély: lépések, alvás, edzések, pulzus.
- A Wim Hofból ténylegesen átadott adattípusok ellenőrzése a telefon Health Connect nézetében; részletes légzéskörök vagy hidegexpozíció importja nem ígérhető ellenőrzés nélkül.
- Első feltöltés előtt látható előnézet és választás. A kiválasztott adatok célja a felhasználó saját Winter Arc/Supabase-fiókja.
- Forrás és rekordazonosító szerinti idempotens mentés; módosítások/törlések követése; több forrás ne duplázza a lépéseket.
- Tulajdonoshoz kötött RLS, leválasztás és importált adatok törlési kezelőfelülete.
- A mért alvásidő külön marad az önbevallásos alvásminőségtől. Hiányzó mérés nem nulla.
- XP nem függ pulzusértéktől, légzésvisszatartási rekordtól vagy hidegexpozíció hosszától.
- Háttérszinkron csak a kézi változat igazolt működése után, külön engedélyekkel.

## Telefonos ellenőrzés
Health Connect → Alkalmazásengedélyek: Samsung Health és Wim Hof.
Samsung Healthnél a négy kért adattípus elérhetősége; Wim Hofnál az írt adattípusok neve és egy már meglévő bejegyzés forrása ellenőrzendő. Jelszót, tokent vagy teljes személyes adatexportot nem kell küldeni.

## Hivatalos források
- https://developer.samsung.com/health/health-connect-faq.html
- https://developer.android.com/health-and-fitness/health-connect/architecture

Ellenőrizve: 2026-11-13. A Wim Hof ténylegesen átadott adatai még nem ellenőrzöttek.
