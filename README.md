# New Exodus Radio: website

**Faith. Unity. Truth. Preparedness.**
Static site (HTML5, CSS3, vanilla JavaScript) for newexodusradio.com. No frameworks, no build step, no server requirements. Upload the folder to any standard host, including cPanel.

## Preview it on your computer

Pages load their content (shows, sponsors, shop categories) from the JSON files in `data/`. Browsers block that when a page is opened straight from disk, so use the included preview server:

1. Double-click **`start-server.bat`**.
2. Your browser opens **http://localhost:8080**.
3. Close the black window to stop the server.

(Any other local server works too, such as `python -m http.server 8080` or VS Code Live Server.)

## Where things live

| To change… | Edit |
|---|---|
| Stream URL, feature switches, time zone | `assets/js/config.js` |
| Programs, show cards, tuning dial | `data/shows.json` |
| Broadcast times | `data/schedule.json` |
| Episodes | `data/episodes.json` |
| Sponsors | `data/sponsors.json` (logos go in `assets/images/sponsors/`) |
| Shop categories and products | `data/products.json` |
| Navigation and footer links | `NAV` and `FOOTER` at the top of `assets/js/main.js` |
| Colors, fonts, spacing | tokens at the top of `assets/css/styles.css` |
| Logo | the `brand()` function in `assets/js/main.js` (swap the text for an `<img>`) |

### Common tasks

**Go live with the stream.** Set `stream.url` in `config.js` to your Icecast or SHOUTcast URL. The player switches from *Offline* to *Stream ready*, and shows *Live* only once audio is actually playing. Optionally set `stream.metadataUrl` to an Icecast `status-json.xsl` URL to show the current title.

**Publish the schedule.** Add slots to `data/schedule.json`, for example:
```json
{ "show": "coffee-with-jesus", "day": "monday", "start": "07:00", "end": "08:00", "tentative": true }
```
The player's *Now playing* and *Up next* update automatically.

**Replace a Coming Soon card.** In `data/shows.json`, change its `status` to `"active"`, fill in the name, period, summary and artwork, then update the matching page in `shows/`.

**Add a host.** Set `"host"` on the show only after the host approves their public biography.

## What's real and what's a placeholder (Phase 1)

Working now:
- Responsive header with mobile menu, footer, all navigation links
- Homepage, all 13 sections
- Player interface and audio engine (persistent bar plus featured player), honest offline state
- Program cards and the hero tuning dial, generated from `data/shows.json`
- Sponsor cards from `data/sponsors.json`, shop categories from `data/products.json`
- SEO basics: unique titles and descriptions, canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt`

Placeholders, clearly labeled on the site:
- **Live stream**: no provider connected; the player shows *Offline* and play is disabled.
- **Schedule**: *Schedule to be announced*; no times are invented.
- **Hosts**: *Host to be announced* on every program.
- **Forms** (newsletter now; prayer, guest, contact later): demonstration mode. Submitting explains that nothing was sent or saved.
- **Shop**: categories only, no products, no payments.
- **Inner pages**: real header, footer and player, with a note describing what's coming in their phase.
- **Artwork and logo**: SVG illustrations and a text logo, easy to replace.
- **Privacy Policy and Terms**: drafts, to be reviewed before any data is collected.
- **Open Graph image**: `assets/images/branding/og-image.png` is a temporary share image.

Not claimed: uninterrupted audio across page changes. Each page load restarts the player. Continuous playback would need page loading without full reloads, planned for a later phase.

## Publishing

The site's code lives on GitHub (private repository `neservicewv/newexodusradio.com`) and in this OneDrive folder; both are kept in step. To put it on GoDaddy, follow **`DEPLOY-GODADDY.md`**.

## Security notes

Everything in this folder is public. Never put API keys, passwords, payment secrets or private listener data (such as prayer requests) in these files. Forms, accounts, admin tools and checkout need a secure backend (Phase 7) before they're switched on in `config.js`.

## Development phases

1. **Foundation** (this release)
2. Program pages, schedule, episode archive
3. Bridging the Gap, prayer requests, testimonies, About, Contact, host profiles
4. Preparedness Center content and guides
5. Preparedness Shop, product pages, cart
6. Live broadcasting integration
7. Backend, administration, secure forms, payments

## Structure

```
index.html  shows.html  listen-live.html  schedule.html  episodes.html
preparedness.html  shop.html  sponsors.html  bridging-the-gap.html
prayer-requests.html  testimonies.html  about.html  contact.html
privacy.html  terms.html  sitemap.xml  robots.txt  start-server.bat/.ps1
shows/        one page per program
preparedness/ one page per preparedness area (water, food storage, power, home, medical, spiritual)
assets/css/   styles.css (core), player.css, responsive.css
assets/js/    config.js, main.js, player.js, schedule.js, shows.js, store.js
assets/images/branding, shows, sponsors, preparedness, products
assets/audio/
data/         shows, schedule, episodes, sponsors, products (.json)
```
