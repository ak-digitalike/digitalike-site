# Gate: Empfehlung zur Geschäftsführung

Stand: 30.09.2026. Basis: [entscheidungsnotiz.md](../research/entscheidungsnotiz.md).

## Empfehlung (eine Zeile)

**WordPress behalten (Option A).** Copy und neue Seiten in Repo `digitalike-site`, Staging-Entwurf in WordPress, Freigabe durch Mensch. Relaunch (Option C) nicht mit den ersten Landingpages mischen.

## Warum jetzt nicht Relaunch

- Erste buchbare Inhalte (`ki schulung`, KI-Angebote) sind in 2 bis 4 Wochen mit Option A erreichbar.
- Relaunch bindet 30 bis 50 Personentage und blockiert kurzfristige Angebotsseiten.
- GenerateBlocks-Seiten, die wir jetzt bauen, wären bei sofortigem Relaunch Wegwerf-Arbeit.

## Was wir mit Option A liefern

| Lieferung | Status im Repo |
|-----------|----------------|
| Entscheidungsnotiz | `docs/research/entscheidungsnotiz.md` |
| Pipeline-Zielbild | `docs/pipeline/cursor-to-staging.md` |
| KI-Schulung Copy | `content/pages/ki-schulung.md` |
| KI-Automatisierung inkl. Blaupause | `content/pages/ki-automatisierung.md` |

Offen bis WP-Zugang: Entwurf auf Staging anlegen, GenerateBlocks-Layout spiegeln.

## Entscheidungsprotokoll

| Feld | Wert |
|------|------|
| Datum | _ausfüllen im Meeting_ |
| Teilnehmer | _ausfüllen_ |
| Gewählte Option | [ ] A WordPress + Repo  [ ] B Headless  [ ] C Relaunch jetzt |
| Staging-URL | _z.B. staging.digitalike.de_ |
| WP-Owner für Publish | _Name_ |
| Nächster Schritt nach Gate | [ ] KI-Schulung auf Staging  [ ] Pipeline-Script  [ ] Relaunch-Scoping |

**Bei Option A (empfohlen):** Landingpages aus diesem Repo in WP übernehmen, Pipeline-Script als zweiter Sprint (24 bis 40 h).

**Bei Option C:** Keine GenerateBlocks-Arbeit für neue Seiten; Relaunch-Scoping (8 h) buchen, Inhalte aus `content/pages/` als Migrations-Quelle nutzen.

## Sign-off

| Rolle | Name | Entscheidung |
|-------|------|--------------|
| Geschäftsführung | | |
| Umsetzung (Arman) | | |
