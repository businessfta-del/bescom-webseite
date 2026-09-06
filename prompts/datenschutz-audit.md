# Datenschutz-Compliance-Audit (DSGVO & TDDDG) — objektfunksysteme.de

Wiederverwendbarer Prompt für Claude Code. Ziel: die Datenschutzerklärung
laufend gesetzeskonform und deckungsgleich mit der tatsächlichen technischen
Praxis halten. Besonders vor/nach dem Aktivieren neuer Dienste (z. B. echter
GoHighLevel-Webhook) erneut ausführen.

> **Nutzung:** Den folgenden Block als Prompt an Claude Code geben.

---

```text
--- DATENSCHUTZ-COMPLIANCE-AUDIT (DSGVO & TDDDG) — objektfunksysteme.de ---

WICHTIGE VERHALTENSANWEISUNG:
Approval-Only-Modus! Führe zunächst KEINE Änderungen durch. Erstelle einen
strukturierten Prüfbericht und warte auf meine Freigabe. Erst NACH Freigabe
umsetzen, live schalten und verifizieren.

ZIEL:
Prüfe die datenschutz.html sowie das GESAMTE Repository auf DSGVO- und
TDDDG-Konformität und Richtigkeit. Ziel: 100 % gesetzeskonform und keine
Abmahnrisiken. Wichtigstes Prinzip: Die Datenschutzerklärung muss EXAKT der
tatsächlichen technischen Praxis im Code entsprechen — keine Klausel zu viel
(nicht genutzte Dienste) und keine zu wenig (nicht offengelegte Verarbeitung).

KONTEXT (aktueller Stand des Projekts — bitte im Code gegenprüfen, nicht blind vertrauen):
- Verantwortlicher: BESCom Elektronik GmbH, Hermann-Blohm-Str. 3, 20457 Hamburg,
  Geschäftsführer Dipl.-Ing. Faouzi Takni (Quelle: impressum.html).
- Hosting: GitHub Pages (GitHub Inc., USA) — statische Seite, Branch master des
  Repos "bescom-webseite". Deploy via: git push live main:master.
- Consent: eigenes Banner assets/js/cookie-banner.js (localStorage
  "bescom_cookie_consent", Kategorien "statistiken" und "externeMedien").
- Google Analytics (G-FBRF16PK5K): consent-gated via type="text/plain"
  data-cookieconsent="statistiken".
- Lead-/CRM-System: GoHighLevel (HighLevel Inc., USA). Zentrale Webhook-Konstante
  CONTACT_WEBHOOK_URL in assets/js/main.js (ggf. noch Platzhalter).
- Formulare/Lead-Kanäle: Projekt-Funnel, Normen-Check (Übergabe an Funnel),
  PDF-Lead-Magnet-Modal (assets/downloads/*.pdf), Rückruf-/Exit-Intent-Modal.
- Fonts (Inter) und AOS sind lokal gehostet (assets/fonts/, assets/vendor/aos/).

PRÜFSCHRITTE:

1) TECHNISCHER SCAN (Ist-Zustand aus dem Code):
   - Liste ALLE externen Domains/Assets/Skripte aus allen *.html und *.js
     (grep auf https-URLs in src/href, fetch/XHR-Ziele, iframe/embeds).
   - Prüfe je Fund: Drittland-Transfer (v. a. USA)? Consent-gated oder lädt
     es ungefragt beim Seitenaufruf? Lokal gehostet oder CDN?
   - Achte speziell auf: Google Fonts/gstatic, andere CDNs (unpkg/jsdelivr/
     cdnjs), Google Analytics/Tag Manager, GoHighLevel/LeadConnector,
     Maps, Social-Pixel, Newsletter-Tools, eingebettete Videos, Schriften.
   - Prüfe, wohin Formulardaten fließen (CONTACT_WEBHOOK_URL & fetch-Aufrufe).

2) ABGLEICH CODE ↔ datenschutz.html (Kern der Prüfung):
   - Für JEDEN im Code aktiven Dienst: existiert eine passende, korrekte
     Klausel? (fehlende offenlegen)
   - Für JEDE Klausel in datenschutz.html: wird der Dienst im Code wirklich
     genutzt? (nicht genutzte / veraltete Klauseln markieren zum Entfernen)
   - Consent-Konsistenz: Werden einwilligungspflichtige Dienste im Code
     wirklich erst NACH Einwilligung geladen, wie im Text behauptet?

3) VOLLSTÄNDIGKEITS- & RICHTIGKEITS-CHECK (Pflichtangaben):
   - Verantwortlicher (Art. 13): Firma, vollständige Anschrift,
     Vertretungsberechtigte(r)/Geschäftsführer, Telefon, E-Mail — 1:1 mit
     impressum.html abgleichen.
   - Rechtsgrundlagen sauber je Verarbeitung: Art. 6 Abs. 1 lit. a
     (Einwilligung), lit. b (Vertrag/Vorvertrag), lit. f (berechtigtes
     Interesse) — plus § 25 Abs. 1/2 TDDDG für Speicherung/Zugriff auf dem
     Endgerät (Cookies/Consent).
   - Drittlandtransfers (USA): AVV nach Art. 28 sowie Rechtsgrundlage nach
     Art. 46 (EU-Standardvertragsklauseln) bzw. EU-U.S. Data Privacy Framework
     — für Hosting (GitHub) UND CRM (GoHighLevel) korrekt benannt.
   - Lead-spezifische Klauseln: Normen-Check/Projekt-Check, PDF-Downloads,
     Kontakt-/Rückruf-Formulare — welche Daten, Zweck, Empfänger (GHL).
   - Betroffenenrechte Art. 15–21: Auskunft, Berichtigung, Löschung,
     Einschränkung, Datenübertragbarkeit, Widerspruch (Art. 21), Widerruf,
     Beschwerderecht — inkl. konkret zuständiger Aufsichtsbehörde
     (Hamburgischer Beauftragter für Datenschutz und Informationsfreiheit,
     HmbBfDI).
   - SSL/TLS-Hinweis (Art. 32), Speicherdauer/Löschkonzept, Server-Logfiles,
     Hinweis bei Minderjährigen, Aktualität der genannten Anbieter-Firmierungen
     und -Adressen (z. B. HighLevel-Adresse), tote Links in den Rechtstext-Quellen.
   - Konsistenz zwischen Inhaltsverzeichnis (TOC), Abschnitts-Nummerierung und
     Anker-IDs (#ds-x).

4) DELIVERABLE — Prüfbericht (noch KEINE Änderung):
   a) Ampel-Tabelle je Dienst/Klausel: „vorhanden & korrekt" / „falsch bzw.
      veraltet" / „fehlt".
   b) Konkrete, fertige deutsche Text-Bausteine für alle Lücken/Korrekturen.
   c) Priorisierung nach Abmahnrisiko (kritisch → niedrig), mit kurzer
      Begründung je Punkt.
   d) Explizite Liste der Annahmen/offenen Fragen an mich (z. B. tatsächlich
      abgeschlossene AVVs, DPF-Zertifizierungsstatus der Anbieter).

WICHTIGE HONESTY-REGEL:
Du bist kein Anwalt — kennzeichne das. Behaupte nichts als „rechtssicher",
sondern prüfe technisch/inhaltlich gegen die DSGVO-/TDDDG-Anforderungen und
empfiehl eine finale anwaltliche Freigabe. Erfinde keine Fakten (Adressen,
Zertifizierungen, AVV-Status) — markiere Unbekanntes als offene Frage.

ABSCHLUSS:
Gib den Prüfbericht aus und frage: „Freigabe zur Umsetzung? (inkl. Antworten
auf die offenen Fragen)". Erst nach meinem GO umsetzen, Cache-Buster erhöhen,
committen und via git push live main:master live schalten und live verifizieren.
```

---

## Bekannter Faktenstand (vom Auftraggeber bestätigt)

- AVVs/DPAs mit **GitHub** und **GoHighLevel** sind über deren Nutzungs­bedingungen
  bzw. Data Processing Addendums (inkl. DPF-Zertifizierung) elektronisch
  akzeptiert und wirksam.
- Ersetzt **nicht** die anwaltliche Endabnahme durch einen Fachanwalt für IT-Recht.
