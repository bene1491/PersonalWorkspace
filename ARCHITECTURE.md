# Architektur

## Überblick

Personal Workspace ist eine reine Client-Anwendung (Single Page App). Es gibt kein Backend, keine Datenbank und keinen Server-Prozess – `vite build` erzeugt statische Dateien, die sich auf jedem Webserver oder lokal via `npm run preview` ausliefern lassen. Persistenz läuft ausschließlich über `window.localStorage`.

```
Browser
 ├─ React-App (Vite-Build, als PWA installierbar)
 │   ├─ App-Shell (Navigation, Befehlspalette, Schnellnotizen, Theme)
 │   ├─ ToastProvider (Undo-Benachrichtigungen, global)
 │   ├─ 9 Workspace-Module (eigene Route je Lebensbereich)
 │   └─ WorkspaceContext (Aufgaben, global)
 ├─ localStorage (Aufgaben, Watchlist, Portfolio, Preis-Alarme, Journal, Prompts, Songideen, Karteikarten, Schnellnotizen, Einstellungen, …)
 ├─ Service Worker (precached App-Shell für Offline-/Installierbarkeit, generiert von vite-plugin-pwa)
 ├─ Notification API (nur bei explizit erteilter Erlaubnis, nur für ausgelöste Preis-Alarme bei offenem Tab)
 └─ optionale, direkte Browser-Fetches zu sechs öffentlichen APIs
     ├─ api.coingecko.com (Marktdaten)
     ├─ api.open-meteo.com / geocoding-api.open-meteo.com (Wetter)
     ├─ api.frankfurter.app (Wechselkurse)
     ├─ date.nager.at (Feiertage)
     ├─ api.alternative.me (Angst-&-Gier-Index)
     └─ api.datamuse.com (Reime/verwandte Wörter)
```

Es gibt keine eigene Backend-API, keine Server-seitige Datenverarbeitung und keinen Datenabfluss an einen eigenen Dienst – nur optionale, direkte Browser-zu-API-Aufrufe an die sechs oben genannten, öffentlichen Quellen. Der von `vite-plugin-pwa` generierte Service Worker cached ausschließlich die eigenen, statischen App-Dateien (JS/CSS/HTML/Icons) für Offline-Start und Installierbarkeit – er fängt keine API-Aufrufe ab und speichert keine Nutzerdaten.

## Warum dieser Stack

Der ursprüngliche Projektauftrag schlug React + TypeScript + Vite + Tailwind + shadcn/ui + Recharts + React Router vor. Umgesetzt wurde **React + TypeScript (strict) + Vite + React Router + Recharts + lucide-react + handgeschriebenes CSS** (`src/index.css`) statt Tailwind/shadcn:

- Für eine App dieser Größe (ein zusammenhängendes Designsystem, keine wiederverwendbare Komponentenbibliothek für Dritte) liefert ein kleines, konsistentes CSS-Modul mit CSS-Custom-Properties (Theming für Dark/Light) denselben visuellen Feinschliff ohne zusätzliche Build-Abhängigkeit.
- Weniger Abhängigkeiten = kleinere Angriffsfläche, schnellere Installation, keine Tailwind-Konfiguration zu pflegen.
- React Router, Recharts und lucide-react wurden wie vorgeschlagen übernommen, da sie für Routing, Diagramme und Icons echten Mehrwert ohne nennenswerten Overhead bieten.

## Verzeichnisstruktur

```
src/
├─ main.tsx                 Einstiegspunkt, rendert <App /> in #root
├─ App.tsx                  Router-Setup, Routen, Theme-/Location-State, Lazy-Loading, ErrorBoundary, ToastProvider
├─ types.ts                 Zentrale, geteilte TypeScript-Typen (Task, MarketAsset, WeatherSnapshot, …)
├─ index.css                Gesamtes Designsystem (Tokens, Layout, Komponenten-Styles)
│
├─ components/               Geteilte, modul-übergreifende UI-Bausteine
│  ├─ AppShell.tsx            Sidebar, Topbar, Befehlspalette (⌘K: Suche + Aktionen), Layout-Rahmen
│  ├─ WorkspaceContext.tsx    React-Context für Aufgaben (einzige global geteilte Domäne)
│  ├─ ToastContext.tsx        Toast-/Undo-Benachrichtigungssystem (Context + Provider + UI)
│  ├─ ErrorBoundary.tsx       Fängt Rendering-Fehler einzelner Routen ab
│  ├─ Sparkline.tsx           Kompaktes Recharts-Flächendiagramm für Kursverläufe
│  ├─ Metronome.tsx           Web-Audio-Metronom mit Tap-Tempo (Music Studio)
│  ├─ PomodoroTimer.tsx       Fokus-/Pausen-Timer mit Ringanzeige (Aufgaben & Planung)
│  ├─ CurrencyConverter.tsx   Währungsrechner-Widget (Finanzen)
│  ├─ PriceAlerts.tsx         Preis-Alarme auf Watchlist-Assets inkl. Browser-Notification (Finanzen)
│  ├─ FearGreedWidget.tsx     Angst-&-Gier-Index-Anzeige (Finanzen)
│  ├─ RhymeFinder.tsx         Reim-/Wortfinder fürs Songwriting (Music Studio)
│  ├─ QuickNotes.tsx          Immer erreichbares Schnellnotizen-Panel (App-Shell-Ebene, Trigger in der Topbar)
│  └─ ui.tsx                  Primitive: Pill, SectionHeading, InfoCard, Notice, EmptyState
│
├─ data/
│  └─ demo.ts                 Explizit gekennzeichnete Beispieldaten (Kurse, Suchindex-Einträge, Workflow-Karten)
│
├─ hooks/
│  ├─ useLocalStorage.ts      Generischer Hook: React-State ↔ localStorage, JSON-serialisiert
│  ├─ useUndoableRemove.ts    Generisches Lösch-mit-Undo-Muster auf Basis von ToastContext
│  ├─ useMarketData.ts        Lädt/verwaltet Status der CoinGecko-Marktdaten
│  ├─ useWeather.ts           Lädt/verwaltet Status der Open-Meteo-Wetterdaten für einen Ort
│  ├─ useNextHoliday.ts       Lädt/verwaltet Status des nächsten gesetzlichen Feiertags
│  └─ useFearGreedIndex.ts    Lädt/verwaltet Status des Angst-&-Gier-Index
│
├─ services/                  Reine Datenzugriffsschicht, ohne UI-Abhängigkeit
│  ├─ marketData.ts            CoinGecko-Adapter (fetch, Mapping auf MarketAsset[])
│  ├─ weather.ts                Open-Meteo-Adapter (Geocoding + Forecast, Mapping auf WeatherSnapshot)
│  ├─ currency.ts               Frankfurter.app-Adapter (Wechselkurs-Konvertierung)
│  ├─ holidays.ts               date.nager.at-Adapter (nächster gesetzlicher Feiertag)
│  ├─ fearGreed.ts              Alternative.me-Adapter (Angst-&-Gier-Index) + deutsche Klassifikations-Labels
│  ├─ rhymes.ts                 Datamuse-Adapter (Reime, verwandte Wörter)
│  ├─ backup.ts                 Sammelt/schreibt alle personal-workspace.*-Storage-Keys als JSON (Export/Import)
│  └─ searchIndex.ts            Liest Prompts/Songideen/Journal/Karteikarten/Watchlist direkt aus localStorage für die Befehlspalette
│
└─ modules/                   Ein Modul pro Hauptbereich der Navigation
   ├─ Dashboard.tsx            Command Center
   ├─ Finance.tsx               Finanzen (Marktübersicht, Portfolio-Tracking, Allokation, Preis-Alarme, Watchlist, Journal, Währungsrechner, Angst-&-Gier-Index) + CoinDetail
   ├─ Tasks.tsx                 Aufgaben & Planung (Liste/Woche/Kanban-Board, Produktivitäts-Chart, Pomodoro-Timer)
   ├─ MusicStudio.tsx           Music Studio (Songideen, Metronom & Tap-Tempo, Reim-/Wortfinder)
   ├─ Study.tsx                 Uni & Studium (Kurse, Feiertage-Widget, Karteikarten & Lernmodus)
   ├─ Documents.tsx             Dateien & Dokumente
   ├─ AiLab.tsx                 AI Lab
   ├─ Automations.tsx           Automatisierungen
   └─ Settings.tsx              Einstellungen & Verbindungen (inkl. Backup-Export/Import)
```

Jedes Modul lebt in seiner eigenen Datei – das war ursprünglich als `WorkspaceModules.tsx`-Sammeldatei umgesetzt und wurde aufgeteilt, sobald einzelne Module (Music Studio, Uni & Studium) durch neue Funktionalität deutlich wuchsen. Das hält jede Datei fokussiert und verbessert das Code-Splitting (siehe unten).

## Architekturprinzipien

**Modul = Route = Zuständigkeit.** Jeder Hauptbereich der Navigation (`src/components/AppShell.tsx`, `navigation`-Array) entspricht genau einer Route in `App.tsx` und einer Komponente in `modules/`. Ein Modul kapselt seine eigene UI und seinen eigenen lokalen State; es greift nicht auf interne Implementierungsdetails eines anderen Moduls zu.

**Eine einzige geteilte Domäne: Aufgaben.** Aufgaben sind das einzige Datenmodell, das modulübergreifend sichtbar ist (Command Center zeigt offene Aufgaben, die globale Suche findet sie, das Aufgaben-Modul verwaltet sie) – daher leben sie in `WorkspaceContext`. Alle anderen Modul-Daten (Watchlist, Journal, Songideen, Prompts, Dokumentkategorien) sind bewusst lokal im jeweiligen Modul über `useLocalStorage` gehalten, mit eigenem Storage-Key. Das vermeidet einen monolithischen globalen Store, den die meisten Module gar nicht brauchen.

**Datenzugriff getrennt von UI.** Jede externe Datenquelle hat einen eigenen Adapter unter `services/` (reine Funktionen: Request rein, typisiertes Domänenobjekt raus, Fehler als geworfene `Error`s) und einen eigenen Hook unter `hooks/` (Status-Maschine: `loading` → `ready` | `error`, plus `refresh()`). UI-Komponenten kennen nur den Hook, nie den Adapter oder das Wire-Format der API direkt. Ein weiterer Datenanbieter (z. B. eine zweite Marktdatenquelle) lässt sich hinzufügen, ohne eine bestehende UI-Komponente anzufassen.

**Keine zirkulären Abhängigkeiten.** Abhängigkeitsrichtung ist strikt: `modules/` → `components/`, `hooks/`, `services/`, `data/`, `types.ts`. Niemals umgekehrt. `services/` hängt nur von `types.ts` ab.

**Ehrliche Zustände statt erfundener Daten.** Jede datengetriebene Ansicht kennt mindestens vier Zustände: lädt, echte Daten vorhanden, Fehler (mit Klartext-Fehlermeldung und manuellem Retry), leer (noch keine eigenen Einträge). Es gibt keinen Zustand, der bei einem fehlgeschlagenen Abruf einen plausiblen, aber erfundenen Ersatzwert anzeigt.

**Löschen ist rückgängig machbar.** Jede Lösch-Aktion auf Nutzerdaten (Aufgaben, Watchlist-Einträge, Journal, Songideen, Kategorien, Prompts, Karteikarten) läuft über `useUndoableRemove`: Das Element wird sofort aus dem State entfernt, ein Toast mit „Rückgängig“ bleibt einige Sekunden sichtbar und stellt das Element bei Klick exakt an seiner ursprünglichen Position wieder her. Das ist ein generischer Hook, kein Modul muss eigene Lösch-Bestätigungsdialoge bauen.

**Abgeleiteter Zustand statt eigener Datenquelle.** Portfolio-Wert, Gewinn/Verlust und die Allokations-Grafik in `Finance.tsx` sind kein eigener API-Aufruf, sondern reine Berechnung (`usePortfolioStats`) aus zwei bereits vorhandenen Dingen: den lokal gespeicherten Positionen und den ohnehin schon von `useMarketData` geladenen Live-Preisen. Preis-Alarme folgen demselben Prinzip, mit einer Besonderheit: Ein neuer Alarm wird zusätzlich sofort beim Anlegen gegen den aktuell bekannten Preis geprüft (nicht erst beim nächsten Datenabruf) – sonst würde ein Alarm, dessen Schwelle bereits beim Erstellen erreicht ist, fälschlich als „Aktiv“ statt „Ausgelöst“ erscheinen, bis die Daten das nächste Mal aktualisiert werden.

**Eine kontrollierte Ausnahme: `searchIndex.ts`.** Damit die Befehlspalette Prompts, Songideen, Journal-Einträge, Karteikarten und Watchlist-Ticker findet, ohne dass jedes dieser Module seinen lokalen State globalisieren muss (was gegen die „einzige geteilte Domäne“-Regel oben verstoßen würde), liest `src/services/searchIndex.ts` deren `localStorage`-Werte direkt und frisch bei jedem Öffnen der Palette. Das ist die einzige Stelle im Code, die `localStorage`-Keys eines anderen Moduls kennt – bewusst zentralisiert, damit kein Modul direkt vom internen Speicherformat eines anderen abhängt.

## Routing & Code-Splitting

`App.tsx` definiert alle neun Routen plus `/finanzen/:id` für Asset-Details. Nur das Dashboard (Landing-Route `/`) wird eager geladen; alle übrigen Module – inklusive `Tasks`, sobald es Recharts für den Produktivitäts-Chart mitbrachte – laufen per `React.lazy()` plus `<Suspense>`. Das hält den initialen JS-Bundle klein: Recharts, das größte Abhängigkeits-Gewicht, lädt erst beim Besuch von `/finanzen` oder `/aufgaben` und wird dabei als gemeinsamer Chunk zwischen beiden geteilt. Eine `ErrorBoundary` um den Routenbereich fängt Rendering-Fehler einzelner Module ab, ohne die gesamte App abstürzen zu lassen.

## Theming

Dark Mode ist Standard. Theme-Umschaltung setzt `document.documentElement.dataset.theme`; `index.css` definiert alle Farben als CSS-Custom-Properties auf `:root` bzw. `:root[data-theme='light']`, sodass kein Komponenten-Code theme-spezifische Werte kennen muss.

Akzentfarben funktionieren nach demselben Muster: `document.documentElement.dataset.accent` (eine von fünf `AccentId`-Optionen, siehe `src/types.ts`) schaltet zusätzliche `:root[data-accent='…']`-Blöcke frei, die `--accent`, `--accent-strong` und `--accent-rgb` überschreiben. Jede dekorative Tönung im CSS (Hover-Hintergründe, Pill-Hintergründe, Fokus-Ringe) referenziert `rgba(var(--accent-rgb), …)` statt eines fest codierten Farbwerts, damit ein Wechsel der Akzentfarbe konsistent durch die gesamte Oberfläche durchschlägt, ohne jede einzelne Stelle anzufassen.

## Installierbarkeit (PWA)

`vite-plugin-pwa` generiert bei `npm run build` ein `manifest.webmanifest` und einen Service Worker (`sw.js`), der ausschließlich die eigenen App-Dateien precached (Strategie `generateSW`, `registerType: 'autoUpdate'`). Das App-Icon (`public/app-icon.svg`, als PNG in `public/icons/` für Manifest/`apple-touch-icon` gerendert) greift das bestehende Marken-Symbol aus der Sidebar auf (⌘ auf Akzentfarbe). PWA-Funktionen sind in der Entwicklung (`npm run dev`) bewusst deaktiviert und nur im Produktionsbuild bzw. `npm run preview` aktiv.

## Barrierefreiheit

Einige konkrete, bewusste Entscheidungen statt eines pauschalen Anspruchs:

- **Fokus-Management statt reinem Ein-/Ausblenden.** Die Befehlspalette merkt sich das zuvor fokussierte Element beim Öffnen (vor dem `autoFocus` des Eingabefelds erfasst, nicht danach – sonst würde das Eingabefeld selbst als „letztes Element“ gelten) und gibt den Fokus beim Schließen exakt dorthin zurück. Dasselbe Muster gilt für das mobile Navigationsmenü (Fokus wandert beim Öffnen auf den Schließen-Button, beim Schließen zurück auf den Menü-Button).
- **Die Befehlspalette ist ein echtes ARIA-Combobox/Listbox-Paar**, nicht nur eine Liste klickbarer `<button>`-Elemente: `role="combobox"` auf dem Eingabefeld, `role="listbox"` auf dem Ergebnisbereich, `role="option"` je Treffer, Pfeiltasten + Enter funktionieren ohne Maus, `aria-activedescendant` hält Screenreader auf dem aktuell markierten Treffer synchron.
- **Drag-and-drop hat immer eine Tastatur-Alternative.** Das Kanban-Board lässt sich per Maus zwischen Spalten verschieben, aber jede Karte hat zusätzlich reguläre, fokussierbare Pfeil-Buttons für denselben Vorgang – die Funktion hängt nie ausschließlich an einer Drag-Geste.
- **Kontrastgeprüfte Textfarben.** `--text-muted` (die am häufigsten verwendete Farbe für Bildunterschriften, Zeitstempel, Hilfetext) wurde in beiden Themes gegen WCAG-AA-Normaltext (4,5:1) nachgerechnet und angepasst; die ursprünglichen Werte lagen mit 4,09:1 (Dark) bzw. 3,39:1 (Light) knapp darunter.
- **Sichtbarer Fokusring überall.** Eine globale `:focus-visible`-Regel deckt interaktive Elemente ab, die keinen eigenen Fokusstil definieren; einzelne Komponenten (Formularfelder, das BPM-Eingabefeld des Metronoms, das zuvor versehentlich jeden Fokusindikator unterdrückte) überschreiben das gezielt mit einer eigenen, stärkeren Variante.

## Vorbereitete, aber inaktive Integrationen

Einige Module (Dateien & Dokumente, Uni & Studium/PDF-Assistent, Music Studio/Audioexport-Analyse, AI Lab, Automatisierungen) zeigen UI für Funktionen, die eine künftige, explizit vom Nutzer freigegebene, ausschließlich lesende Dateisystem- oder API-Integration voraussetzen. Diese v0.1 enthält dafür **keinen** Code, der tatsächlich auf das Dateisystem zugreift, einen Ordner durchsucht oder einen externen KI-Anbieter aufruft – die UI kennzeichnet diese Bereiche konsequent als „nicht verbunden“ bzw. „nicht aktiviert“. (Karteikarten & Quiz sind davon ausgenommen: Dieses Werkzeug ist inzwischen vollständig funktional und lokal gespeichert, nicht mehr nur angekündigt.) Details zu den Sicherheitsgrenzen: [SECURITY.md](./SECURITY.md).
