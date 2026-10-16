# Personal Workspace v0.1

Ein lokales, privates Dashboard, das persönliche Lebensbereiche – Finanzen, Musikproduktion, Studium, Dokumente, Aufgaben, KI-Experimente und mehr – in einer einzigen, hochwertigen Oberfläche zusammenführt. Alle Daten bleiben im LocalStorage deines Browsers; es gibt keinen Server, kein Backend und keinen Zugriff auf dein Dateisystem.

Diese v0.1 ist bewusst konservativ: Sie liest **keine** persönlichen Dateien, verbindet sich mit **keinen** Konten und führt **keine** Automatisierungen tatsächlich aus. Details zu den Sicherheitsgrenzen stehen in [SECURITY.md](./SECURITY.md), zum tatsächlichen Umsetzungsstand in [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) und zur Architektur in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Schnellstart

Voraussetzung: Node.js 20+ (getestet mit Node 22) und npm.

```bash
npm install
npm run dev
```

Die Anwendung läuft danach unter `http://localhost:5173`.

### Weitere Befehle

```bash
npm run build     # Typecheck (tsc -b) + Produktionsbuild nach dist/
npm run preview   # Produktionsbuild lokal unter http://localhost:4173 ansehen
npm run lint      # oxlint über den gesamten Quellcode
```

## Was diese Version kann

- **Command Center** – Tagesüberblick, offene Aufgaben, Marktschnappschuss, Wetter-Widget, Verbindungsstatus.
- **Finanzen** – echte, live abgerufene Krypto-Kurse (CoinGecko), 7-Tage-Sparklines, Asset-Detailseiten, ein Währungsrechner (EZB-Kurse), lokale Watchlist und ein lokales Investment-Journal.
- **Music Studio** – lokale Songideen-Bibliothek, ein echtes Metronom mit Tap-Tempo (Web Audio API), Produktions-Checkliste, vorbereitete (inaktive) Audioexport-Analyse.
- **Uni & Studium** – Kurse/Module als Beispieldaten, ein spielbares Karteikarten- & Quiz-System, ein Feiertage-Widget (echte Daten), PDF-Assistent als klar gekennzeichneter, noch nicht aktiver Platzhalter.
- **Dateien & Dokumente** – Architektur für eine spätere, ausdrücklich freigegebene, rein lesende Dateiintegration; aktuell ohne jeden Dateisystemzugriff.
- **Aufgaben & Planung** – vollständige, lokal gespeicherte Aufgabenverwaltung (anlegen, bearbeiten, filtern, erledigen, löschen) mit drei Ansichten – Liste, Woche und ein **Kanban-Board** mit Drag & Drop (plus tastaturbedienbaren Verschieben-Buttons) –, einem Produktivitäts-Chart und einem eingebauten Pomodoro-/Fokus-Timer.
- **AI Lab** – lokale Prompt-Bibliothek; keine Verbindung zu einem KI-Anbieter, keine API-Keys, keine Datenübertragung.
- **Automatisierungen** – Übersicht künftiger Workflows; nichts davon läuft tatsächlich.
- **Einstellungen & Verbindungen** – Dark/Light-Mode, fünf wählbare Akzentfarben, kompakte Dichte, Ort für Wetterdaten, JSON-Backup (Export/Import aller lokalen Daten), transparenter Datenquellen- und Datenschutzstatus.

Alle Module, die noch keine echte Datenquelle besitzen, kennzeichnen das explizit in der Oberfläche statt erfundene Daten als echt auszugeben. Lösch-Aktionen laufen über ein Toast-System mit **Rückgängig**-Option statt sofort endgültig zu sein.

Die globale Suche (⌘K) ist zu einer echten Befehlspalette ausgebaut: Sie durchsucht nicht nur die Navigation und deine Aufgaben, sondern auch Karteikarten, Prompts, Songideen, Journal-Einträge und die Watchlist – und kann direkt Aktionen ausführen („Neue Aufgabe anlegen“, „Theme umschalten“, „Pomodoro-Timer starten“), per Maus oder komplett über die Pfeiltasten und Enter.

Die App ist außerdem als **PWA installierbar** (eigenes App-Icon, läuft im eigenen Fenster ohne Browser-Chrome) – in Chrome/Edge über das Installieren-Symbol in der Adressleiste, auf dem iPhone über „Zum Home-Bildschirm“ in Safari.

## Echte Datenquellen

Diese v0.1 ruft vier öffentliche, kostenlose APIs direkt aus deinem Browser ab – ohne API-Key, ohne Server dazwischen:

| Quelle | Zweck | Endpunkt |
|---|---|---|
| [CoinGecko](https://www.coingecko.com/en/api) | Krypto-Kurse, 24h-Veränderung, 7-Tage-Sparkline, Marktkapitalisierung | `api.coingecko.com` |
| [Open-Meteo](https://open-meteo.com/) | Geocoding + aktuelles Wetter für einen frei wählbaren Ort | `geocoding-api.open-meteo.com`, `api.open-meteo.com` |
| [Frankfurter.app](https://www.frankfurter.app/) | EZB-Referenzkurse für den Währungsrechner | `api.frankfurter.app` |
| [date.nager.at](https://date.nager.at/) | Gesetzliche Feiertage (Deutschland) | `date.nager.at` |

Aktien/ETFs sind bewusst **nicht** integriert: Mir sind keine kostenlosen, API-Key-freien Quellen bekannt, die zuverlässig per Browser-Fetch (CORS) erreichbar sind – eine kaputte oder nur scheinbar funktionierende Integration wollten wir nicht ausliefern. Alle vier oben genannten Quellen zeigen Quelle, Zeitstempel und einen expliziten Fehlerzustand bei nicht erreichbarer API – es werden nie erfundene Ersatzwerte angezeigt.

> **Hinweis für Cloud-Sessions:** Läuft diese App in einer Sandbox mit eingeschränktem Netzwerkzugriff (z. B. bestimmte Cloud-Entwicklungsumgebungen), können diese Hosts blockiert sein. Auf deinem eigenen Rechner mit `npm run dev` funktionieren alle Abrufe normal.

## Sicherheit auf einen Blick

- Kein Zugriff auf dein Dateisystem, keine Ordnersuche, keine Indexierung persönlicher Dateien.
- Keine Konten-, Broker- oder KI-Anbieter-Verbindung, keine API-Keys.
- Alle App-Daten (Aufgaben, Watchlist, Journal, Prompts, Songideen, Karteikarten, Einstellungen) liegen ausschließlich im `localStorage` deines Browsers – du kannst sie jederzeit unter Einstellungen → Backup als JSON exportieren oder wiederherstellen.
- Tastatur- und Screenreader-bedienbar: Befehlspalette und mobiles Menü verwalten den Fokus korrekt, alle Interaktionen (inklusive Kanban-Board) funktionieren ohne Maus, Text-Kontraste sind gegen WCAG AA geprüft.
- Vollständige Details: [SECURITY.md](./SECURITY.md).

## Tech-Stack

React 19 · TypeScript (strict) · Vite · React Router · Recharts · lucide-react · vite-plugin-pwa · reines CSS (keine UI-Bibliothek, kein Tailwind) – siehe [ARCHITECTURE.md](./ARCHITECTURE.md) für die Begründung und den Modulaufbau.
