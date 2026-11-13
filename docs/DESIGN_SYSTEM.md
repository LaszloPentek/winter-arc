# Winter Arc design

A fő vizuális gesztus egy eredeti, holdfényes hegyvidék. Nem másol játékfelületet és nem használ jogvédett karakterképet. A környező felület csendes, jól olvasható.

| Szerep | Szín |
|---|---|
| Háttér | #0B1017 |
| Felület | #17212B |
| Emelt felület | #22303D |
| Jégkék | #91CDE8 |
| Fő szöveg | #E8EDF2 |
| Másodlagos szöveg | #9CAAB8 |
| Óarany | #C5A46D |
| Vörös / zöld / lila | #C76565 / #7CA58B / #A98BD4 |

Címsor: Georgia; törzsszöveg: Segoe UI / rendszer sans-serif. Nincs külső fontkérés. Balra rendezett tartalom, a Sanctuary felirat a briefnek megfelelően nagybetűs. Desktop fix oldalsáv, mobil alsó navigáció. A széles tájkép után alacsony időszaksáv, 6 mérés, baseline és nyugodt üzenet. Nem minden modul azonos súlyú kártya.

Mobil 320px-től: két mérés/oszlop, egyoszlopos tartalmi panelek, minimum 44px gombok. A számmezők nincsenek önkényesen előtöltve 5-re: a felhasználó kifejezetten választ. Szöveges állapotok a színek mellett; látható fókusz; valódi label és fieldset; reduced-motion. Nincs kéretlen animáció.

Az alap grafika: public/images/winter.svg; logó: public/icon.svg. A kért trófeaképek nincsenek meg, P0 nem hivatkozik nem létező jpg/png fájlokra.
