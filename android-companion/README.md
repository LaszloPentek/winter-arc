# Winter Arc Android – helyi Health Connect előnézet

Tesztalkalmazás Android 14+ telefonokra. Nem a weboldal teljes Android-verziója, és még nem szinkronizál a felhővel.

- Olvasás csak gombnyomásra, az utolsó 7 napról, részleges engedélyezéssel is.
- Samsung Health: lépések, alvási időszakok, edzésbejegyzések, utolsó pulzusminta.
- Wim Hof: mindfulness és edzés rekordok külön, forráscsomag szerinti szűréssel.
- Hiányzó adat és megtagadott engedély külön állapot; mindfulness elérhetőség ellenőrzése.
- Nincs INTERNET engedély, háttérmunka, tárolás, analitika vagy adatnaplózás.
- Az előnézet onStop eseménynél törlődik; képernyőkép és alkalmazásváltó-előnézet tiltott.
- 10 000 rekord felett az adott típus olvasása hibával zárul, nem közöl részleges összesítést.

Build: Gradle 8.11.1, JDK 17, Android SDK 36, `gradle :app:assembleDebug :app:lintDebug`.
A GitHub Actions Android kapcsolat APK workflow telepíthető debug APK-t ad. A debug aláírás buildenként változhat; ez egyetlen első teszttelepítésre szolgál. Terjesztéshez stabil, biztonságosan tárolt aláírókulcs szükséges.

Telefonos ellenőrzés: engedély nélkül ne olvasson, részleges engedéllyel mutassa a hiányt, az előnézet forrásappokkal összehasonlítható legyen, háttérbe lépés után ne maradjon látható adat. A Health Connect engedélyeit a felhasználó választja ki a telefonon. Engedélyek kiadása és valós adatok ellenőrzése még nem történt meg.

Hivatalos alapok:
https://developer.android.com/health-and-fitness/health-connect/get-started
https://developer.android.com/health-and-fitness/health-connect/features/mindfulness
