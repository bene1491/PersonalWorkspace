# Architektur

## Überblick

Personal Workspace ist eine reine Client-Anwendung (Single Page App). Es gibt kein Backend, keine Datenbank und keinen Server-Prozess – `vite build` erzeugt statische Dateien, die sich auf jedem Webserver oder lokal via `npm run preview` ausliefern lassen. Persistenz läuft ausschließlich über `window.localStorage`.

```
Browser
 ├─ React-App (Vite-Build)
 │   ├─ App-Shell (Navigation, Suche, Theme)
 │   ├─ 9 Workspace-Module (eigene Route je Lebensbereich)
 │   └─ WorkspaceContext (Aufgaben, global)
 ├─ localStorage (Aufgaben, Watchlist, Journal, Prompts, Songideen, Einstellungen)
 └─ optionale, direkte Browser-Fetches zu zwei öffentlichen APIs
     ├─ api.coingecko.com (Marktdaten)
     └─ api.open-meteo.com / geocoding-api.open-meteo.com (Wetter)
```

Es gibt keine eigene Backend-API, keine Server-seitige Datenverarbeitung und keinen Datenabfluss an einen eigenen Dienst – nur optionale, direkte Browser-zu-API-Aufrufe an die beiden oben genannten, öffentlichen Quellen.

## Warum dieser Stack

Der ursprüngliche Projektauftrag schlug React + TypeScript + Vite + Tailwind + shadcn/ui + Recharts + React Router vor. Umgesetzt wurde **React + TypeScript (strict) + Vite + React Router + Recharts + lucide-react + handgeschriebenes CSS** (`src/index.css`) statt Tailwind/shadcn:

- Für eine App dieser Größe (ein zusammenhängendes Designsystem, keine wiederverwendbare Komponentenbibliothek für Dritte) liefert ein kleines, konsistentes CSS-Modul mit CSS-Custom-Properties (Theming für Dark/Light) denselben visuellen Feinschliff ohne zusätzliche Build-Abhängigkeit.
- Weniger Abhängigkeiten = kleinere Angriffsfläche, schnellere Installation, keine Tailwind-Konfiguration zu pflegen.
- React Router, Recharts und lucide-react wurden wie vorgeschlagen übernommen, da sie für Routing, Diagramme und Icons echten Mehrwert ohne nennenswerten Overhead bieten.

## Verzeichnisstruktur

```
src/
├─ main.tsx                 Einstiegspunkt, rendert <App /> in #root
├─ App.tsx                  Router-Setup, Routen, Theme-/Location-State, Lazy-Loading, ErrorBoundary
├─ types.ts                 Zentrale, geteilte TypeScript-Typen (Task, MarketAsset, WeatherSnapshot, …)
├─ index.css                Gesamtes Designsystem (Tokens, Layout, Komponenten-Styles)
│
├─ components/               Geteilte, modul-übergreifende UI-Bausteine
│  ├─ AppShell.tsx            Sidebar, Topbar, globale Suche (⌘K), Layout-Rahmen
│  ├─ WorkspaceContext.tsx    React-Context für Aufgaben (einzige global geteilte Domäne)
│  ├─ ErrorBoundary.tsx       Fängt Rendering-Fehler einzelner Routen ab
│  ├─ Sparkline.tsx           Kompaktes Recharts-Flächendiagramm für Kursverläufe
│  └─ ui.tsx                  Primitive: Pill, SectionHeading, InfoCard, Notice, EmptyState
│
├─ data/
│  └─ demo.ts                 Explizit gekennzeichnete Beispieldaten (Kurse, Suchindex-Einträge, Workflow-Karten)
│
├─ hooks/
│  ├─ useLocalStorage.ts      Generischer Hook: React-State ↔ localStorage, JSON-serialisiert
│  ├─ useMarketData.ts        Lädt/verwaltet Status der CoinGecko-Marktdaten
│  └─ useWeather.ts           Lädt/verwaltet Status der Open-Meteo-Wetterdaten für einen Ort
│
├─ services/                  Reine Datenzugriffsschicht, ohne UI-Abhängigkeit
│  ├─ marketData.ts            CoinGecko-Adapter (fetch, Mapping auf MarketAsset[])
│  └─ weather.ts                Open-Meteo-Adapter (Geocoding + Forecast, Mapping auf WeatherSnapshot)
│
└─ modules/                   Ein Modul pro Hauptbereich der Navigation
   ├─ Dashboard.tsx            Command Center
   ├─ Finance.tsx               Finanzen (Marktübersicht, Watchlist, Journal) + CoinDetail (Asset-Detailseite)
   ├─ Tasks.tsx                 Aufgaben & Planung
   └─ WorkspaceModules.tsx      MusicStudio, Study, Documents, AiLab, Automations, Settings
```

## Architekturprinzipien

**Modul = Route = Zuständigkeit.** Jeder Hauptbereich der Navigation (`src/components/AppShell.tsx`, `navigation`-Array) entspricht genau einer Route in `App.tsx` und einer Komponente in `modules/`. Ein Modul kapselt seine eigene UI und seinen eigenen lokalen State; es greift nicht auf interne Implementierungsdetails eines anderen Moduls zu.

**Eine einzige geteilte Domäne: Aufgaben.** Aufgaben sind das einzige Datenmodell, das modulübergreifend sichtbar ist (Command Center zeigt offene Aufgaben, die globale Suche findet sie, das Aufgaben-Modul verwaltet sie) – daher leben sie in `WorkspaceContext`. Alle anderen Modul-Daten (Watchlist, Journal, Songideen, Prompts, Dokumentkategorien) sind bewusst lokal im jeweiligen Modul über `useLocalStorage` gehalten, mit eigenem Storage-Key. Das vermeidet einen monolithischen globalen Store, den die meisten Module gar nicht brauchen.

**Datenzugriff getrennt von UI.** Jede externe Datenquelle hat einen eigenen Adapter unter `services/` (reine Funktionen: Request rein, typisiertes Domänenobjekt raus, Fehler als geworfene `Error`s) und einen eigenen Hook unter `hooks/` (Status-Maschine: `loading` → `ready` | `error`, plus `refresh()`). UI-Komponenten kennen nur den Hook, nie den Adapter oder das Wire-Format der API direkt. Ein weiterer Datenanbieter (z. B. eine zweite Marktdatenquelle) lässt sich hinzufügen, ohne eine bestehende UI-Komponente anzufassen.

**Keine zirkulären Abhängigkeiten.** Abhängigkeitsrichtung ist strikt: `modules/` → `components/`, `hooks/`, `services/`, `data/`, `types.ts`. Niemals umgekehrt. `services/` hängt nur von `types.ts` ab.

**Ehrliche Zustände statt erfundener Daten.** Jede datengetriebene Ansicht kennt mindestens vier Zustände: lädt, echte Daten vorhanden, Fehler (mit Klartext-Fehlermeldung und manuellem Retry), leer (noch keine eigenen Einträge). Es gibt keinen Zustand, der bei einem fehlgeschlagenen Abruf einen plausiblen, aber erfundenen Ersatzwert anzeigt.

## Routing & Code-Splitting

`App.tsx` definiert alle neun Routen plus `/finanzen/:id` für Asset-Details. Das Dashboard (Landing-Route `/`) wird eager geladen, alle übrigen Module per `React.lazy()` plus `<Suspense>` – das hält den initialen JS-Bundle klein (Recharts, das größte Abhängigkeits-Gewicht, lädt erst beim Besuch von `/finanzen`). Eine `ErrorBoundary` um den Routenbereich fängt Rendering-Fehler einzelner Module ab, ohne die gesamte App abstürzen zu lassen.

## Theming

Dark Mode ist Standard. Theme-Umschaltung setzt `document.documentElement.dataset.theme`; `index.css` definiert alle Farben als CSS-Custom-Properties auf `:root` bzw. `:root[data-theme='light']`, sodass kein Komponenten-Code theme-spezifische Werte kennen muss.

## Vorbereitete, aber inaktive Integrationen

Mehrere Module (Dateien & Dokumente, Uni & Studium/PDF-Assistent, Music Studio/Audioexport-Analyse, AI Lab, Automatisierungen) zeigen UI für Funktionen, die eine künftige, explizit vom Nutzer freigegebene, ausschließlich lesende Dateisystem- oder API-Integration voraussetzen. Diese v0.1 enthält dafür **keinen** Code, der tatsächlich auf das Dateisystem zugreift, einen Ordner durchsucht oder einen externen KI-Anbieter aufruft – die UI kennzeichnet diese Bereiche konsequent als „nicht verbunden“ bzw. „nicht aktiviert“. Details zu den Sicherheitsgrenzen: [SECURITY.md](./SECURITY.md).
