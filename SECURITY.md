# Sicherheit, Berechtigungen & Datenschutz

Diese Datei dokumentiert verbindlich, was Personal Workspace v0.1 technisch tut und was nicht. Sie ist die Referenz für alle Sicherheitsaussagen, die auch in der Oberfläche selbst (Notice-Hinweise in jedem Modul) auftauchen.

## Grundprinzip

Personal Workspace ist eine rein clientseitige Web-App ohne eigenes Backend. Es gibt **keinen Code**, der auf das Dateisystem des Rechners zugreift, auf dem die App läuft – weder lesend noch schreibend, weder lokal noch über einen Server. Ein Browser kann von sich aus ohnehin nicht beliebig auf das Dateisystem zugreifen; diese App macht zusätzlich keinerlei Gebrauch von Browser-APIs, die das punktuell erlauben würden (z. B. File System Access API). Die einzige Dateiberührung der gesamten App ist das optionale Backup unter Einstellungen (siehe „Backup-Export/-Import“ unten) – ein gewöhnlicher Browser-Download bzw. ein einzelner, vom Nutzer per Klick ausgewählter `<input type="file">`-Upload, der die Datei nur lokal im Browser einliest. Es gibt keinen Ordner-Picker, keine Drag-&-Drop-Dateiübernahme und keinen Datei-Upload an einen Server.

## Entstehungskontext dieser Version

Diese v0.1 wurde in einer isolierten Cloud-Entwicklungsumgebung gebaut, die selbst keinerlei Zugriff auf den Rechner oder die persönlichen Dateien des Auftraggebers hatte – sichtbar war ausschließlich dieses Git-Repository. Die im ursprünglichen Projektauftrag beschriebene Sperrzone (`Uni → 8. Semester → Bachelorarbeit`) und der Schutz von Musikoriginalen waren dadurch nicht nur eine Verhaltensregel, sondern strukturell unerreichbar: Es gab nie eine Verbindung zu diesen Ordnern, aus der heraus eine Verletzung überhaupt möglich gewesen wäre.

Das ändert nichts an der Verbindlichkeit der folgenden Regeln für die App selbst und für jede künftige Weiterentwicklung – sie gelten unabhängig davon, in welcher Umgebung als Nächstes daran gearbeitet wird.

## Dauerhafte Sperrzone: Bachelorarbeit

Der Ordner `Uni → 8. Semester → Bachelorarbeit` (und alles, was eindeutig zu dieser Arbeit gehört, unabhängig von Ablageort oder Benennung) ist dauerhaft gesperrt:

- Kein Lesen, Öffnen, Indexieren, Zusammenfassen oder Klassifizieren von Inhalten daraus.
- Keine Aufnahme in Suche, Caches, Embeddings oder einen KI-Kontext.
- Keine Kopier-, Verschiebe-, Lösch-, Umbenennungs- oder Bearbeitungsoperation.
- Diese Sperre gilt unabhängig davon, ob der Ordner zufällig entdeckt wird, und darf durch keine künftige Komfortfunktion, automatische Freigabe oder Einstellung aufgehoben werden.

Jede künftige, vom Nutzer *explizit* freigegebene Dateiintegration (siehe unten) muss diese Sperre unabhängig von der allgemeinen Freigabe-Logik durchsetzen.

## Schutz von Musikoriginalen

DAW-Projekte, Audioaufnahmen, Exporte, Beats, Presets, Sample-Bibliotheken, Lyrics/Notizen sowie Mix-/Master-Versionen dürfen von dieser Anwendung – auch in künftigen Versionen – niemals gelöscht, umbenannt, verschoben, überschrieben oder destruktiv bearbeitet werden. Eine spätere Freigabe eines Musikordners darf ausschließlich lesend erfolgen; Analysefunktionen (z. B. Peak/Loudness-Auswertung) dürfen nur mit Kopien bzw. abgeleiteten, getrennt gespeicherten Daten arbeiten, nie mit dem Original selbst.

## Weitere persönliche Dateien

Es gibt keinen automatischen Scan persönlicher Ordner, keine Desktop-/Dokumente-/Downloads-Durchsuchung, kein automatisches Öffnen oder Indexieren. Jede künftige Freigabe muss sich auf einen vom Nutzer konkret benannten Ordner beschränken – eine Freigabe ist niemals eine Erlaubnis, weitere Ordner zu entdecken oder zu durchsuchen.

## System & Abhängigkeiten

- Kein `sudo`, keine globalen Paketinstallationen, keine Änderungen an Homebrew/Betriebssystem-Konfiguration, globalen Umgebungsvariablen, Shell-Konfiguration oder globalen Git-Einstellungen.
- Alle Abhängigkeiten sind projektlokal in `package.json` deklariert und werden über `npm install` in `node_modules/` installiert (nicht global).
- Kein dauerhafter Hintergrunddienst, kein LaunchAgent, kein Scheduler. `npm run dev` startet einen gewöhnlichen, im Vordergrund laufenden Entwicklungsserver, der mit `Strg+C` beendet wird.
- Der Produktionsbuild enthält einen von `vite-plugin-pwa` generierten Service Worker, der ausschließlich die eigenen, statischen App-Dateien (JS/CSS/HTML/Icons) für Offline-Start cached. Er fängt keine API-Aufrufe ab, verändert keine Antworten und hat keinen Zugriff auf `localStorage`-Inhalte oder das Dateisystem. Er ist nur im Produktionsbuild/`npm run preview` aktiv, nicht in `npm run dev`.

## Netzwerkzugriffe – vollständige Liste

Diese App kontaktiert genau sechs externe, öffentliche, kostenlose Hosts, alle direkt aus dem Browser (kein eigener Server dazwischen):

| Host | Wann | Gesendete Daten | Zweck |
|---|---|---|---|
| `api.coingecko.com` | Beim Öffnen von „Finanzen“, „Aufgaben & Planung“ oder „Command Center“, sowie manuell per Aktualisieren-Button | Keine personenbezogenen Daten – reiner, parameterloser Marktdaten-Request | Krypto-Kurse |
| `geocoding-api.open-meteo.com` | Beim Öffnen des Command Centers bzw. nach Ändern des Orts in den Einstellungen | Der vom Nutzer in „Einstellungen → Ort für Wetterdaten“ eingetragene Ortsname (als URL-Parameter) | Ort → Koordinaten auflösen |
| `api.open-meteo.com` | Direkt im Anschluss an die Geocoding-Antwort | Die zuvor aufgelösten Koordinaten | Aktuelles Wetter |
| `api.frankfurter.app` | Bei Eingabe im Währungsrechner (Finanzen), mit kurzer Verzögerung nach dem Tippen | Betrag sowie Ausgangs-/Zielwährungscode (z. B. „EUR“, „USD“) | Wechselkurs-Umrechnung |
| `date.nager.at` | Beim Öffnen von „Uni & Studium“ | Keine personenbezogenen Daten – fest auf Deutschland (`DE`) eingestellter Request | Nächster gesetzlicher Feiertag |

Es werden **keine** Konto-, Zahlungs- oder Zugangsdaten übertragen, keine Cookies von Drittanbietern gesetzt, kein Tracking/Analytics eingebunden. Schlägt ein Abruf fehl (Netzwerkfehler, Rate-Limit, nicht erreichbar), zeigt die App einen expliziten Fehlerzustand mit Klartextmeldung – es wird nie ein erfundener Ersatzwert als echtes Ergebnis ausgegeben.

## Backup-Export/-Import

Unter Einstellungen → Backup kann der Nutzer alle App-Daten als JSON-Datei herunterladen („Exportieren“) oder eine zuvor exportierte Datei wieder einlesen („Importieren“). Beides läuft vollständig lokal im Browser:

- **Export** erzeugt die Datei aus den aktuellen `localStorage`-Werten mit der Blob-/`URL.createObjectURL`-API und löst einen gewöhnlichen Browser-Download aus. Es wird nichts an einen Server gesendet.
- **Import** liest eine vom Nutzer über den nativen Datei-Dialog ausgewählte Datei rein lokal mit der `File`-API, validiert sie auf das erwartete Format und schreibt die enthaltenen Werte zurück in `localStorage`. Vor dem Überschreiben bestätigt der Nutzer explizit per Dialog, dass die aktuell gespeicherten Daten ersetzt werden.

Diese Funktion berührt ausschließlich die von dieser App selbst verwalteten Daten (siehe Tabelle unten) – sie liest, durchsucht oder verändert keine anderen Dateien oder Ordner auf dem Rechner.

## Lokale Datenspeicherung

Alle App-eigenen Daten liegen ausschließlich im `localStorage` des verwendenden Browsers, pro Browser-Profil und Origin getrennt, unverschlüsselt (wie bei `localStorage` üblich) und ohne Synchronisation an einen Server:

| Storage-Key | Inhalt |
|---|---|
| `personal-workspace.tasks.v1` | Aufgaben |
| `personal-workspace.watchlist.v1` | Finanz-Watchlist (Ticker-Symbole) |
| `personal-workspace.investment-journal.v1` | Investment-Journal-Einträge |
| `personal-workspace.music-entries.v1` | Music-Studio-Songideen |
| `personal-workspace.document-categories.v1` | Lokale Dokumentkategorien (nur Namen, keine Dateien) |
| `personal-workspace.prompts.v1` | AI-Lab-Prompt-Bibliothek |
| `personal-workspace.flashcards.v1` | Karteikarten (Uni & Studium) |
| `personal-workspace.pomodoro-settings.v1` | Fokus-/Pausen-Dauer des Pomodoro-Timers |
| `personal-workspace.theme.v1` | Dark/Light-Einstellung |
| `personal-workspace.location.v1` | Ort für Wetterdaten |
| `personal-workspace.compact-mode.v1` | Dichte-Einstellung |

Genau diese Keys sind es auch, die der Backup-Export/-Import (siehe oben) sammelt bzw. zurückschreibt – definiert an einer einzigen Stelle in `src/services/backup.ts`, damit die Liste nicht divergieren kann. Löschen der Browserdaten für diese Seite entfernt alle genannten Inhalte vollständig und unwiderruflich, sofern zuvor kein Backup exportiert wurde.

## Explizit nicht vorhanden in dieser Version

- Keine Verbindung zu Brokerkonten, kein Portfolio-Import, keine Kauf-/Verkaufsfunktion.
- Keine Verbindung zu einem externen KI-Anbieter, keine API-Keys, keine Übertragung von Chat-Inhalten.
- Keine echte Audioverarbeitung oder -analyse von Audiodateien (Peak/Loudness/etc. sind als Datenmodell vorbereitet, aber inaktiv). Das Metronom erzeugt ausschließlich eigene, synthetische Audio-Clicks über die Web Audio API – es liest, analysiert oder speichert keine Audiodateien.
- Keine tatsächlich laufenden Automatisierungen, Scheduler oder Hintergrundprozesse.
- Keine Dateisystem-Indexierung, kein PDF-Assistent mit echtem Dateizugriff.

Die Oberfläche kennzeichnet jede dieser Lücken aktiv als „nicht verbunden“ bzw. „nicht aktiviert“, statt sie stillschweigend wegzulassen.

## Leitplanken für künftige Erweiterungen

Wird in einer späteren Version eine echte, lesende Dateisystem-Integration (z. B. für „Dateien & Dokumente“) umgesetzt, gelten unverändert:

1. Freigabe ist explizit, pro Ordner, durch den Nutzer – nie automatisch oder pauschal.
2. Zugriff ist rein lesend; keine Lösch-, Umbenennungs- oder Schreiboperation auf Originale.
3. Indizes/abgeleitete Daten werden getrennt von den Originalen gespeichert.
4. Die Bachelorarbeits-Sperrzone bleibt unabhängig von jeder allgemeinen Freigabe in Kraft.
5. Musikoriginale bleiben in jedem Fall unverändert; Analysen laufen nicht-destruktiv.
