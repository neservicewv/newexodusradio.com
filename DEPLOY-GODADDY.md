# Putting newexodusradio.com on GoDaddy

This folder is the whole website. There's no build step: what's here is exactly what goes on the server.

## What to upload, and what to leave off

Upload everything **except** these (they're for working on the site, not for visitors):

- `Concepts/` (design artwork drafts)
- `PDF Guides/` (your original guide files; the site uses the renamed copies in `guides/`)
- `README.md`, `DEPLOY-GODADDY.md`
- `start-server.bat`, `start-server.ps1`
- `.github/`, `.gitignore` (hidden GitHub files, if you see them)

## Option A: GoDaddy File Manager (easiest, no extra software)

1. Log in to GoDaddy → **My Products** → your hosting plan → **cPanel Admin**.
2. Open **File Manager** and go into the `public_html` folder.
3. Delete GoDaddy's default placeholder page if there is one (often `index.html` or `default.html`).
4. On your computer, open this folder, select everything from the list above that belongs on the site, right-click → **Send to → Compressed (zipped) folder**.
5. In File Manager click **Upload**, pick that .zip, then back in `public_html` right-click the .zip → **Extract**. Delete the .zip afterwards.
6. Visit https://newexodusradio.com. `index.html` must sit directly inside `public_html`, not inside a subfolder.

## Option B: FTP with FileZilla

1. In cPanel, open **FTP Accounts** and create one (or use the main cPanel login).
2. In FileZilla connect with host `ftp.newexodusradio.com`, that username and password, port 21.
3. Drag the site files from the left (this folder) into `public_html` on the right.

## Option C: one-click from GitHub (optional, set up once)

The GitHub repository has a **Deploy to GoDaddy** action that uploads the site over FTP, leaving off the files listed above. It only runs when you start it.

1. On GitHub open the repository → **Settings → Secrets and variables → Actions → New repository secret**, and add:
   - `FTP_SERVER`: `ftp.newexodusradio.com`
   - `FTP_USERNAME`: your cPanel FTP username
   - `FTP_PASSWORD`: that account's password
2. Go to the **Actions** tab → **Deploy to GoDaddy** → **Run workflow**.

Your FTP password lives only in GitHub's encrypted secrets, never in these files.

## After going live

- Turn on HTTPS: cPanel → **SSL/TLS Status** (GoDaddy hosting plans usually include an SSL certificate).
- Every page refers to `https://newexodusradio.com/...` for sharing links and the sitemap, so the domain must point at this hosting.
