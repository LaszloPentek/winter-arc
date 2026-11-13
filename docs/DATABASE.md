# Adatmodell

| P0 tábla | Kulcs / cél |
|---|---|
| profiles | user_id → auth.users, Budapest időzóna |
| challenges | UUID; unique(user_id,slug), kezdet, vég, opcionális lezárás |
| baselines | (user_id,day); külön kiinduló mérés; energia/motiváció null |
| daily_checkins | (user_id,day); 6 mutató, megjegyzés, műszak, alvásidő, pihenőnap, revision |
| checkin_versions | (user_id,day,revision); korábbi teljes szerverváltozatok |
| sync_operations | (user_id,operation_id); idempotens visszaigazolások |

Minden személyes tábla idegen kulcsa auth.users(id), ON DELETE CASCADE. Minden tábla RLS-védett. Authenticated csak saját rekordot olvashat. Közvetlen INSERT/UPDATE/DELETE visszavonva; az írás kizárólag a szigorúan ellenőrzött security definer RPC-n át engedett. Mindkét RPC auth.uid()-ból veszi a tulajdonost, üres search_path-ot használ, és PUBLIC/anon nem hívhatja. Kliens nem adhat user_id-t a mentéshez.

initialize_winter_arc(): minden létrehozás ON CONFLICT DO NOTHING; nem ír felül meglévő adatot.

save_checkin(operation,expected,data): mezőellenőrzés, felhasználói tranzakciózár, műveletismétlés visszaadása, verzióegyeztetés, előzménymentés és visszaigazolás ugyanabban a tranzakcióban. A pontszámokra és mezőkre adatbázis-megszorítások is érvényesek. Jövőbeli nap nem menthető.

## Tervezett P1–P4 relációk
emotion_entries, trigger_entries, journal_entries: UUID + user_id + day; több rekord/nap. A check-inhez opcionális (user_id,day) kapcsolat, de önálló bejegyzést is lehessen menteni.

habits: UUID + user_id + kategória + heti cél + archived_at. habit_completions: unique(user_id,habit_id,day), összetett tulajdonosi idegen kulccsal a szokáshoz, így idegen felhasználó szokására sem lehet hivatkozni.

detox_entries: unique(user_id,day); külön social_free és politics_free. weekly_reflections: unique(user_id,week_start). user_settings: user_id elsődleges kulcs.

achievements: globális, olvasható definíciók; achievement_unlocks: unique(user_id,achievement_id), dátum és eseményazonosító. custom_achievements: UUID, user_id, saját feltétel. A beépített és privát képek külön útvonalon. Storage bucket privát, objektumkulcs user_id/UUID, RLS minden olvasásra/írásra, megjelenítés rövid élettartamú signed URL-lel. A Storage bevezetése P3 feladat; P0 nem hoz létre nyilvános bucketet.

## Tesztelési korlát
A tesztek ugyanazt a migrációt futtatják PGlite PostgreSQL-ben, auth sémával és anon/authenticated szerepekkel. Ez valódi SQL/RLS-végrehajtás, de a JWT ellenőrzését a Supabase végzi élesben. A hosztolt Auth, Realtime, hálózati újrapróbálás és két eszköz együttműködését a saját Supabase-projekten külön kell ellenőrizni a README listája szerint.
