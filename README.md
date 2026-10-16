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
- **Finanzen** – echte, live abgerufene Krypto-Kurse (CoinGecko), 7-Tage-Sparklines, Asset-Detailseiten, lokale Watchlist und ein lokales Investment-Journal.
- **Music Studio** – lokale Songideen-Bibliothek, Produktions-Checkliste, vorbereitete (inaktive) Audioexport-Analyse.
- **Uni & Studium** – Kurse/Module als Beispieldaten, Lernwerkzeuge als klar gekennzeichnete, noch nicht aktive Platzhalter.
- **Dateien & Dokumente** – Architektur für eine spätere, ausdrücklich freigegebene, rein lesende Dateiintegration; aktuell ohne jeden Dateisystemzugriff.
- **Aufgaben & Planung** – vollständige, lokal gespeicherte Aufgabenverwaltung (anlegen, bearbeiten, filtern, erledigen, löschen).
- **AI Lab** – lokale Prompt-Bibliothek; keine Verbindung zu einem KI-Anbieter, keine API-Keys, keine Datenübertragung.
- **Automatisierungen** – Übersicht künftiger Workflows; nichts davon läuft tatsächlich.
- **Einstellungen & Verbindungen** – Dark/Light-Mode, kompakte Dichte, Ort für Wetterdaten, transparenter Datenquellen- und Datenschutzstatus.

Alle Module, die noch keine echte Datenquelle besitzen, kennzeichnen das explizit in der Oberfläche statt erfundene Daten als echt auszugeben.

## Echte Datenquellen

Diese v0.1 ruft zwei öffentliche, kostenlose APIs direkt aus deinem Browser ab – ohne API-Key, ohne Server dazwischen:

| Quelle | Zweck | Endpunkt |
|---|---|---|
| [CoinGecko](https://www.coingecko.com/en/api) | Krypto-Kurse, 24h-Veränderung, 7-Tage-Sparkline | `api.coingecko.com` |
| [Open-Meteo](https://open-meteo.com/) | Geocoding + aktuelles Wetter für einen frei wählbaren Ort | `geocoding-api.open-meteo.com`, `api.open-meteo.com` |

Beide Integrationen zeigen Quelle, Zeitstempel und einen expliziten Fehlerzustand bei nicht erreichbarer API – es werden nie erfundene Ersatzwerte angezeigt.

> **Hinweis für Cloud-Sessions:** Läuft diese App in einer Sandbox mit eingeschränktem Netzwerkzugriff (z. B. bestimmte Cloud-Entwicklungsumgebungen), können diese beiden Hosts blockiert sein. Auf deinem eigenen Rechner mit `npm run dev` funktionieren beide Abrufe normal.

## Sicherheit auf einen Blick

- Kein Zugriff auf dein Dateisystem, keine Ordnersuche, keine Indexierung persönlicher Dateien.
- Keine Konten-, Broker- oder KI-Anbieter-Verbindung, keine API-Keys.
- Alle App-Daten (Aufgaben, Watchlist, Journal, Prompts, Songideen, Einstellungen) liegen ausschließlich im `localStorage` deines Browsers.
- Vollständige Details: [SECURITY.md](./SECURITY.md).

## Tech-Stack

React 19 · TypeScript (strict) · Vite · React Router · Recharts · lucide-react · reines CSS (keine UI-Bibliothek, kein Tailwind) – siehe [ARCHITECTURE.md](./ARCHITECTURE.md) für die Begründung und den Modulaufbau.
