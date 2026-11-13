# Külső skillek ellenőrzése — 2026-11-13

1. https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
   - Elérhető, deklaratív Markdown, Codexben használható.
   - A saját LICENSE.txt Apache 2.0: https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/LICENSE.txt
   - Változtatás nélkül integrálva .agents/skills/frontend-design/ alá, licenccel együtt. A meglévő helyi frontend-design skillt a fejlesztéshez elolvastuk és alkalmaztuk.
2. https://github.com/vikingokft/ai-webdesign/tree/main/tervezes
   - A raw SKILL.md elérhető és Codex-kompatibilis utasításokat tartalmaz. A kész brief miatt az interjúfolyamat itt nem szükséges.
3. https://github.com/vikingokft/ai-webdesign/tree/main/generalas
   - A raw SKILL.md elérhető, Codexre is kitér. Statikus, többkoncepciós prototípusfolyamat; nem egyezik a megrendelt működő React/Supabase P0-val.

A vikingokft repository LICENSE címén nem sikerült licencet igazolni, a GitHub license API 404 választ adott. Ez nem bizonyítja, hogy semmilyen más licencfeltétel nem létezik. A csomagokat ezért nem másoltuk be és nem terjesztjük a projektben; hivatkozott háttérdokumentációként kezeltük. A gépen meglévő példányok tartalmát is ellenőriztük. Későbbi újrafelhasználás előtt a licenc tisztázandó.

A külső utasítások nem írhatják felül a felhasználó explicit P0-megbízását, nem indíthatnak automatikus publikálást, adatküldést vagy felesleges jóváhagyási kört.
