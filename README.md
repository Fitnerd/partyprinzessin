# Partyprinzessin – Website

Astro (statisch) + eine Cloudflare Pages Function für das Anfrageformular.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Astro-Dev-Server (http://localhost:4321). Das Formular-Backend läuft hier **nicht**. |
| `npm run pages` | Build + `wrangler pages dev` (http://localhost:8788) – Seite **mit** `/api/anfrage`. |
| `npm test` | Unit- und Endpoint-Tests (Vitest). |
| `npm run check` | TypeScript-/Astro-Prüfung. |
| `npm run build` | Statischer Build nach `dist/`. |

Ohne `.dev.vars` läuft das Backend im Dev-Modus: Anfragen werden validiert und die fertige Mail wird nur im Terminal ausgegeben.

## Formular-Backend

- Endpoint: `functions/api/anfrage.ts` → `POST /api/anfrage`
- Validierung und Mail-Text: `src/lib/anfrage.ts` (wird auch in den Tests genutzt)
- Preis-/Zonenlogik: `src/lib/pricing.ts`, PLZ-Bereiche in `src/data/site.ts` (`zonen`)
- Funktioniert auch ohne JavaScript (303-Redirect auf `/danke`).
- Spam-Schutz: Honeypot-Feld immer aktiv, Cloudflare Turnstile optional.

### Umgebungsvariablen

Lokal in `.dev.vars` (Vorlage: `.dev.vars.example`), produktiv im Cloudflare-Dashboard unter *Pages → Projekt → Settings → Variables and Secrets*.

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `RESEND_API_KEY` | ja (prod) | API-Key von resend.com (Free: 3.000 Mails/Monat). Als **Secret** anlegen. |
| `MAIL_TO` | ja (prod) | Deine Adresse, an die Anfragen gehen. |
| `MAIL_FROM` | ja (prod) | z. B. `Partyprinzessin <anfrage@partyprinzessin.de>` – Domain muss bei Resend verifiziert sein. |
| `TURNSTILE_SECRET` | optional | Secret Key von Cloudflare Turnstile. |
| `PUBLIC_TURNSTILE_SITEKEY` | optional | Site Key – **Build-Variable**, blendet das Widget ein. Nur zusammen mit `TURNSTILE_SECRET` setzen. |
| `NTFY_TOPIC` | optional | Push aufs Handy über die ntfy-App. Langen, zufälligen Namen wählen (Topics auf ntfy.sh sind öffentlich). Die Push enthält nur Datum, Paket, PLZ und Kinderzahl. |
| `NTFY_SERVER` | optional | Standard `https://ntfy.sh`. |

## Deployment (Cloudflare Pages)

1. Repo auf GitHub anlegen und pushen.
2. Cloudflare Dashboard → *Workers & Pages → Create → Pages → Connect to Git*.
3. Build command `npm run build`, Output `dist`. Der Ordner `functions/` wird automatisch erkannt.
4. Variablen aus der Tabelle oben eintragen, neu deployen.
5. Domain verbinden und in `astro.config.mjs` (`site`) eintragen.
6. Bei Resend die Absender-Domain verifizieren (DNS-Einträge bei Cloudflare).
7. Test-Anfrage über die Live-Seite abschicken.

## Vor dem Launch

- `TODO`s im Code suchen: WhatsApp-Nummer, E-Mail, Instagram, Domain, Fotos, Texte.
- Impressum und Datenschutz ausfüllen (Hosting Cloudflare, Mailversand Resend, ggf. Turnstile und ntfy erwähnen).
- PLZ-Zonen in `src/data/site.ts` prüfen.
- Theme festlegen, `showThemeSwitch` auf `false`, nicht genutzte `.only-a`/`.only-b`-Varianten entfernen.
