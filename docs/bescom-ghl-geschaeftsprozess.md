# BESCom – GHL-Geschäftsprozess (objektfunksysteme.de)

> **Zweck dieser Datei:** Zentrale fachliche Referenz für den BESCom-Vertriebs- und
> Geschäftsprozess. Bereits getroffene Entscheidungen sind hier verbindlich festgehalten
> und dürfen bei zukünftigen Arbeiten **nicht eigenständig verändert** werden.
> Offene Punkte sind ausdrücklich mit **OFFEN** gekennzeichnet – sie sind noch nicht entschieden.
>
> **Repository:** `bescom-webseite` (Website `www.objektfunksysteme.de`)
> **Stand der Dokumentation:** Verifizierter Repository-Stand, kein Commit/Deploy im Rahmen dieser Doku.

---

## 0. Grundprinzip: 28 Geschäftsprozesse ≠ 7 GHL-Pipeline-Stufen

Diese Trennung ist **zentral** und verbindlich:

- Die **28 Geschäftsprozesse** (Abschnitt 3) beschreiben den **vollständigen Geschäftsablauf**
  von der Lead-Entstehung bis zum Cross-Selling. Sie sind das fachliche Gesamtmodell.
- Die **7 GHL-Pipeline-Stufen** (Abschnitt 2) bilden **nur den schlanken Vertriebsstatus** ab.

**Die 28 Prozesse sind NICHT automatisch 28 Pipeline-Stufen.**

Beispiele:
- „Kalkulation" ist ein Geschäftsprozess – **aber keine** GHL-Pipeline-Stufe.
- „Technische Prüfung" ist ein Geschäftsprozess – **aber keine** GHL-Pipeline-Stufe.
- „Lead prüfen", „Duplikat prüfen", „Interne Freigabe", „Nachfassen" werden **nicht** zu eigenen
  Pipeline-Stufen. Sie werden über Aufgaben, Felder, Workflows oder andere führende Systeme abgebildet.

Geschäftsprozessmodell und CRM-Pipeline bleiben damit **getrennt**.

---

## 1. Minimal-First-Leitplanken (verbindlich für zukünftige Arbeiten)

- **Minimal First** – einfachste funktionierende Lösung zuerst.
- Keine unnötigen Pipeline-Stufen.
- Keine unnötigen Automationen.
- Keine Daten-Duplikation.
- Bestehende Systeme **integrieren statt ersetzen**.
- **Konfiguration vor Code.**
- **SSOT beachten** (siehe Abschnitt 4).
- **Keine eigenständigen Architekturentscheidungen** durch Claude.

Vor **jeder** Implementierung prüfen:

1. Welches System ist führend?
2. Muss diese Information überhaupt in GHL gespeichert werden?
3. Existiert bereits eine Funktion?
4. Ist eine Automation wirklich notwendig?
5. Wird eine zweite SSOT erzeugt?

---

## 2. GHL-Pipeline (verbindliche Entscheidung – 7 Stufen)

Die GHL-Pipeline bleibt bewusst **schlank**. Verbindlich sind genau diese **7 Stufen**:

| # | Pipeline-Stufe        |
|---|-----------------------|
| 1 | Neuer Lead            |
| 2 | Termin vereinbart     |
| 3 | Erstgespräch geführt  |
| 4 | Qualifiziert          |
| 5 | Angebot versendet     |
| 6 | Gewonnen              |
| 7 | Verloren              |

> **Nicht** die zuvor diskutierte 10-Stufen-Pipeline verwenden.
> **Keine** zusätzlichen Pipeline-Stufen eigenständig erfinden.
> Die detaillierten 28 Geschäftsprozesse bestehen **unabhängig** davon weiter.

---

## 3. Die 28 Geschäftsprozesse

**Spaltenlegende:**
- **Führendes System** = System mit der fachlichen Datenhoheit (SSOT) für diesen Schritt.
- **Übergabe** = an welches System/welchen Schritt übergeben wird.
- **Status** = fachlicher Reifegrad des Prozesses (*definiert* / *OFFEN*).
- **Automatisierungspotenzial** = Einschätzung (*hoch* / *mittel* / *gering*).
- **Umsetzungsstatus** = technischer Umsetzungsstand (*umgesetzt* / *in Umsetzung* / *geplant* / *nicht umgesetzt*).

> Wo eine Information noch nicht verbindlich entschieden ist, steht **OFFEN**.
> Es werden **keine** Annahmen als Entscheidung dargestellt.

### Priorisierung
- **Fokus 1–18** (direkter Umsatzprozess): zuerst vollständig verstehen, umsetzen, testen.
- **19–28** werden hier **dokumentiert**, aber **nicht automatisch implementiert**
  (Wartung, Service, Cross-Selling = nachgelagerte Ausbaustufen).

---

### Prozesse 1–18 — Direkter Umsatzprozess (Fokus)

| Nr. | Prozess | Zweck | Auslöser | Rolle | Führendes System | Übergabe | Status | Automatisierungspotenzial | Umsetzungsstatus |
|----|---------|-------|----------|-------|------------------|----------|--------|---------------------------|------------------|
| 1 | Lead-Eingang | Neue Anfrage erfassen | Kontaktformular auf `objektfunksysteme.de` | System / Interessent | GHL | → Lead-Benachrichtigung | definiert | hoch | ✅ **produktiv** – Website → n8n → GHL, E2E verifiziert 2026-09-09 (siehe Abschnitt 5) |
| 2 | Lead-Benachrichtigung | Zuständige informieren | Neuer Lead (Website) | n8n (Orchestrierung) | n8n (Orchestrierung, **keine SSOT**) | → Lead prüfen | definiert | hoch | ✅ **produktiv** – E-Mail an ov@bescom.de, verifiziert 2026-09-09 |
| 3 | Lead prüfen | Anfrage sichten, Ersteinordnung | Benachrichtigung | Vertrieb | GHL | → Duplikat prüfen | definiert | mittel | geplant |
| 4 | Duplikat prüfen | Doppelten Kontakt vermeiden | Lead prüfen | Vertrieb / n8n | GHL | → Bestehenden Contact verwenden / neuer Contact | OFFEN (Regeln OFFEN) | mittel | geplant |
| 5 | Bestehenden Contact verwenden | Vorhandenen Kontakt weiterführen | Duplikat gefunden | Vertrieb | GHL | → Lead qualifizieren | definiert | gering | geplant |
| 6 | Lead qualifizieren | Passung/Bedarf bewerten | Contact vorhanden | Vertrieb | GHL | → Qualifiziert-Entscheidung | definiert | mittel | geplant |
| 7 | Qualifiziert / nicht qualifiziert | Go/No-Go setzen | Qualifizierung abgeschlossen | Vertrieb | GHL (Pipeline-Stufe „Qualifiziert") | → Erstkontakt / „Verloren" | definiert | gering | geplant |
| 8 | Erstkontakt | Direkter Kontakt zum Interessenten | Lead qualifiziert | Vertrieb | GHL | → Technische Ersteinschätzung | definiert | gering | geplant |
| 9 | Technische Ersteinschätzung | Machbarkeit/Umfang technisch grob klären | Erstkontakt erfolgt | Technik | OFFEN (techn. Daten → Supabase, Ablage OFFEN) | → Kalkulation | OFFEN | gering | geplant |
| 10 | Kalkulation | Preis/Aufwand ermitteln | Technische Einschätzung liegt vor | Kalkulation / Vertrieb | OFFEN | → Interne Freigabe | OFFEN | mittel | geplant |
| 11 | Interne Freigabe | Angebot intern genehmigen | Kalkulation fertig | Leitung / Vertrieb | OFFEN (GHL-Feld/Task oder ClickUp – OFFEN) | → Angebot beauftragen | OFFEN | gering | geplant |
| 12 | Angebot beauftragen | Angebotserstellung anstoßen | Freigabe erteilt | Vertrieb | GHL → WISO (Übergabe) | → WISO-Kunde prüfen/anlegen | definiert | mittel | geplant |
| 13 | WISO-Kunde prüfen/anlegen | Kaufm. Stammdaten sicherstellen | Angebot beauftragt | Backoffice | WISO | → WISO-Angebot erstellen | definiert | mittel | geplant |
| 14 | WISO-Angebot erstellen | Verbindliches Angebot erzeugen | WISO-Kunde vorhanden | Backoffice | WISO | → Angebot versendet | definiert | mittel | geplant |
| 15 | Angebot versendet | Angebot an Kunden übermitteln | Angebot erstellt | Vertrieb / Backoffice | WISO (Dokument) · GHL (Vertriebsstatus „Angebot versendet") | → Nachfassen | definiert | mittel | geplant |
| 16 | Nachfassen | Angebot aktiv verfolgen | Angebot versendet | Vertrieb | GHL (Aufgabe/Workflow, **keine** Pipeline-Stufe) | → Angebot angenommen / „Verloren" | definiert | hoch | geplant |
| 17 | Angebot angenommen | Zusage erfassen | Kundenrückmeldung | Vertrieb | GHL (Vertriebsstatus) · WISO (kaufm.) | → Auftrag gewonnen | definiert | gering | geplant |
| 18 | Auftrag gewonnen | Auftrag als gewonnen markieren | Angebot angenommen | Vertrieb | GHL (Pipeline-Stufe „Gewonnen") | → Projekt anlegen | definiert | gering | geplant |

### Prozesse 19–28 — Nachgelagerte Ausbaustufen (jetzt nur dokumentiert)

| Nr. | Prozess | Zweck | Auslöser | Rolle | Führendes System | Übergabe | Status | Automatisierungspotenzial | Umsetzungsstatus |
|----|---------|-------|----------|-------|------------------|----------|--------|---------------------------|------------------|
| 19 | Projekt anlegen | Umsetzungsprojekt eröffnen | Auftrag gewonnen | Projektleitung | ClickUp | → Projekt durchführen | definiert | mittel | nicht umgesetzt |
| 20 | Projekt durchführen | Leistung erbringen | Projekt angelegt | Projektteam | ClickUp | → Abnahme | definiert | gering | nicht umgesetzt |
| 21 | Abnahme | Leistung förmlich abnehmen | Projekt abgeschlossen | Projektleitung / Kunde | OFFEN (ClickUp? Dokument in Google Drive?) | → Rechnung | OFFEN | gering | nicht umgesetzt |
| 22 | Rechnung | Leistung fakturieren | Abnahme erfolgt | Backoffice | WISO | → Zahlung | definiert | mittel | nicht umgesetzt |
| 23 | Zahlung | Zahlungseingang erfassen | Rechnung gestellt | Backoffice | WISO | → Bestandskunde | definiert | mittel | nicht umgesetzt |
| 24 | Bestandskunde | Kunde in Betreuung überführen | Zahlung erfolgt | Vertrieb / Service | GHL (Beziehung) · Supabase (Objekt-/Anlagendaten) | → Wartungspotenzial | definiert | gering | nicht umgesetzt |
| 25 | Wartungspotenzial | Wartungsbedarf erkennen | Bestandskunde / Anlage vorhanden | Service | Supabase (Wartungen/Anlagen) | → Wartungsvertrag | OFFEN | mittel | nicht umgesetzt |
| 26 | Wartungsvertrag | Wartung vertraglich binden | Wartungspotenzial erkannt | Vertrieb / Backoffice | OFFEN (WISO kaufm. + Supabase Anlage – Zusammenspiel OFFEN) | → Service / Störung | OFFEN | gering | nicht umgesetzt |
| 27 | Service / Störung | Störungen/Serviceeinsätze abwickeln | Kundenmeldung / Wartungsintervall | Service | OFFEN (ClickUp Einsatz? Supabase Anlagenhistorie?) | → Cross-Selling | OFFEN | mittel | nicht umgesetzt |
| 28 | Cross-Selling | Zusatzbedarf erschließen | Servicekontakt / Bestandskunde | Vertrieb | GHL | → (neuer Zyklus ab Lead) | definiert | mittel | nicht umgesetzt |

---

## 4. Systemverantwortlichkeiten / SSOT (verbindlich)

| System | Führende Verantwortung (SSOT) |
|--------|-------------------------------|
| **GHL** | Leads, Kontakte, Opportunities, Vertriebsstatus |
| **WISO** | Angebote, Rechnungen, kaufmännische Daten |
| **ClickUp** | Projekte, Aufgaben, operative Durchführung |
| **Google Drive** | Dokumente |
| **Supabase** | Objekte, Anlagen, technische Daten, Wartungen |
| **Notion** | SOPs / Wissen |
| **n8n** | Orchestrierung / Integration |
| **MEOS Dashboard** | Zusammenführen und Anzeigen – **keine eigene SSOT** |

**Verbindliche Regeln:**
- **n8n ist niemals SSOT.** n8n orchestriert und integriert nur.
- **GHL** dupliziert **keine** Daten, deren führendes System **WISO, ClickUp, Supabase, Google Drive oder Notion** ist.
- **MEOS Dashboard** ist **keine** eigene fachliche Datenquelle – es zeigt nur zusammengeführte Daten an.

---

## 5. B3 – Website / GHL (produktiv, End-to-End verifiziert am 2026-09-09)

**Status: ✅ produktiv umgesetzt und End-to-End getestet** (`bescom-webseite`, Website `www.objektfunksysteme.de`).

**Produktiver Datenfluss:**

```
Website-Kontaktformular  →  n8n-Webhook  →  n8n  →  GHL Contact/Lead  →  E-Mail an ov@bescom.de
```

**Belegte Fakten aus dem Code (`assets/js/main.js`):**
- Das Kontaktformular (`.js-contact-form`) sendet per `fetch()` einen **POST (JSON)** an die
  produktive Webhook-URL (`CONTACT_WEBHOOK_URL`).
- Produktive n8n-Webhook-URL: `https://n8n-ujih.srv1675981.hstgr.cloud/webhook/bescom-lead`.
- Übermittelte Felder: `name`, `firma`, `telefon`, `email`, `leistung`, `nachricht`, `seite`
  — **korrekt übertragen** (im Test verifiziert).
- Client-seitige Pflichtfeldprüfung: Name, Firma, E-Mail **oder** Telefon, Datenschutz-Zustimmung.
- **Erfolgsanzeige** der Website funktioniert (Success-Meldung bei HTTP 200); Fehler-Fallback mit
  direkter Telefonnummer.

**Verifizierter End-to-End-Ablauf (n8n-Workflow „BESCom – Website Leads → GoHighLevel + E-Mail"):**
1. **Webhook** empfängt den POST (Respond: Immediately, HTTP 200).
2. **Normalize Lead** mappt die Formularfelder (u. a. `name` → Vor-/Nachname, `telefon` → `phone`,
   `firma` → `company`); `source = website`.
3. **GoHighLevel** legt den **Contact/Lead an bzw. aktualisiert ihn** (`/contacts/upsert`) und setzt
   den Tag **`website-lead`**. GHL bleibt **führendes System (SSOT)** für Leads/Contacts/Opportunities.
4. **E-Mail-Benachrichtigung** an **`ov@bescom.de`** wird versendet (SMTP, verifiziert).

**Wichtige technische Hinweise:**
- Die n8n-Antwort `{"message":"Workflow was started"}` bestätigt nur den **Start**; der Erfolg der
  Folge-Nodes ist im n8n-**Executions-Log** einzusehen.
- GHL `/contacts/upsert` **dedupliziert per E-Mail ODER Telefon** — identische Telefonnummer/E-Mail
  aktualisiert einen bestehenden Kontakt statt einen neuen anzulegen (relevant nur für Tests).
- Es ist **kein natives GHL-Formular** produktiv. Der produktive Lead-Erfassungspfad ist
  **Website → n8n → GHL**.

**Abgrenzung zukünftiger Entscheidungen:**
- Eine spätere Umstellung auf ein **natives GHL-Formular** ist eine **separate, zukünftige
  Architekturentscheidung** und in diesem Dokument **nicht** als umgesetzt dargestellt.

---

## 6. Offene Punkte (Sammlung – Stand dieser Doku)

- ~~Konkrete n8n-Webhook-URL für das Kontaktformular~~ → ✅ **erledigt** (produktiv, siehe Abschnitt 5).
- ~~Konkrete n8n → GHL-Verarbeitung (Mapping, Felder)~~ → ✅ **erledigt & verifiziert** (Abschnitt 5).
  Offen bleibt nur die **Pipeline-Zuordnung** der Opportunity (Stufe „Neuer Lead").
- **Duplikatregeln** (Prozess 4). Hinweis: GHL-Upsert dedupliziert bereits per E-Mail/Telefon.
- Führendes System / Ablage für **Technische Ersteinschätzung** (9), **Kalkulation** (10),
  **Interne Freigabe** (11), **Abnahme** (21), **Wartungsvertrag** (26), **Service/Störung** (27).
- Zusammenspiel **WISO ↔ Supabase** bei Wartung (25/26).

> Diese Punkte sind bewusst als **OFFEN** markiert und dürfen nicht durch Annahmen ersetzt werden.
