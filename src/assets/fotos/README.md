# Fotos

Hier einfach die Fotos ablegen (JPG, PNG oder WebP, gern in Originalgröße).
Astro verkleinert sie beim Build und wandelt sie in WebP um. GPS- und andere Metadaten werden dabei entfernt.
Fehlt eine Datei, zeigt die Seite an dieser Stelle weiter den Platzhalter.

| Datei                | Wo                                   | Format                              |
|----------------------|--------------------------------------|-------------------------------------|
| hero-a.jpg           | Hero Theme A (Bogen), auch Social-Vorschau | Hochformat, Ganzkörper          |
| hero-b.jpg           | große Kachel im Hero Theme B         | Hochformat, gern knallig            |
| hero-b-klein.jpg     | kleine Kachel im Hero Theme B        | beliebig, z. B. Tanzszene           |
| schneekoenigin.jpg   | Figuren-Kachel                       | wird quadratisch, Gesicht mittig    |
| meerjungfrau.jpg     | Figuren-Kachel                       | "                                   |
| rapunzel.jpg         | Figuren-Kachel                       | "                                   |
| aschenputtel.jpg     | Figuren-Kachel                       | "                                   |
| sternenheldin.jpg    | Figuren-Kachel                       | "                                   |
| ueber-mich.jpg       | Abschnitt „Über mich“                | Hochformat 4:5                      |
| og.jpg (optional)    | eigenes Vorschaubild für WhatsApp & Co., sonst wird hero-a genommen | Querformat 1200×630 |

Endung egal (.jpg/.jpeg/.png/.webp), Groß-/Kleinschreibung egal. HEIC vom iPhone bitte vorher als JPG exportieren.
Bildausschnitt anpassen: in der Komponente `position="center top"` o. Ä. setzen.
