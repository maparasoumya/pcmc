# PCMC CAP platform

This workspace contains the updated citizen portal, staff panel, and the supporting Django APIs. The original ZIP files are unchanged.

## Local setup

Use Node 22+ (22.12 or newer) and Python 3.12+.

```sh
cd CAP-BACKEND
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py import_portal_content
.venv/bin/python manage.py createsuperuser
cd ../pcmc-cap-platform
npm ci
npm run install:apps
npm run dev
```

Citizen portal: http://127.0.0.1:5173. Staff panel: http://127.0.0.1:5174. API: http://127.0.0.1:8000/api/.

Sign in with the **username** created by `createsuperuser`, or its unique email address. There are no default passwords or bypasses. Django's `is_staff` flag authorises staff panel access and API writes. Both existing role labels currently share staff editing rights. To give an existing user access, an administrator must set `is_staff`; ordinary accounts cannot edit public content or read submissions.

Each frontend supports `VITE_API_URL` (see its `.env.example`). Set it before building for hosting. Backend settings load ignored `.env.local` and `.env` files; exported variables take precedence. `.env.example` is a reference and is not loaded automatically.

## Editing and publishing

The supplied ZIP’s original page layouts, images and all 18 CSS files are retained. Backend integration uses the existing forms.

- **Sectors:** edit the eight existing sectors using the original sector editor.
- **Events:** use the original event form, choose Published, and save. Upcoming events appear on the homepage and Get Involved page.
- **Resources / projects:** save using the original forms. Resources support document URLs and file uploads.
- **Progress:** enter the sector, goal, target, current value and unit in the original progress form. Published values fill the original citizen tracker cards.
- **Map data:** use the original layer dashboard and editor. Enter verified latitude and longitude for point markers before publishing. The requested risk list panels remain removed; map controls and markers are retained.
- **Suggestions and queries:** citizens submit through the links on the original Get Involved cards. Staff open **Suggestions & Queries** at `/suggestions`, click a submission to read it, update its status or save internal notes. Marking Responded does not send an email.
- **Site settings:** expand **Platform Configuration** in Admin Settings for About text, form questions, social links and privacy wording. Links there open CEE initiatives and vendor management using forms styled like the original pages.

Content saves to the server database. Staff session tokens are kept in session storage. Content is not stored only in the browser.

## Content still to supply

The interfaces are functional, but the client must provide approved About copy, CEE reports/photos, confirmed events, social handles, verified vendor contacts, resources, progress figures, privacy wording and any missing Marathi translations. No fictional public records or demo submissions are installed. Only sector text from the supplied project is imported.

## Verification

```sh
cd pcmc-cap-platform
npm run build
npm run lint
cd ../CAP-BACKEND
.venv/bin/python manage.py test publishing
```

Browser workflow tests are in `pcmc-cap-platform/tests`. Run them against **an isolated development database**, never a live service. Start the API and both frontends, install the Playwright browser with `npx playwright install chromium`, and export `PCMC_TEST_CREDENTIALS` to a JSON file containing a test staff username/password. Then run `npm run test:e2e`. Optional `PCMC_CHROMIUM` specifies an existing Chromium executable. Tests create public records and submissions in that test database.

## Vercel deployment

Production configuration, PostgreSQL support, persistent S3-compatible media and direct browser uploads are now included. See [DEPLOYMENT.md](DEPLOYMENT.md) for the three Vercel projects, exact environment variables, storage CORS, database release command and first staff login. Live hosting still requires valid provider accounts and provisioned database/storage resources.

Staff read citizen responses under **Suggestions & Queries** at `/suggestions`. Both types are stored in the database, with search, status controls and internal review notes. No automatic reply email is sent.

The rich portal content uses `/api/publications/`; older thematic-area APIs remain available for compatibility. Vendor screens use the vendor API; the original progress editor uses progress publications. `/api/submissions/` accepts public submissions; reads, edits and deletes require staff. `/api/uploads/intent/` and `/api/uploads/complete/` coordinate cloud uploads. `/api/assets/` is retained for local development uploads only.

The ZIP visual comparison test is optional: set `PCMC_BASELINE_UI=1` and serve the unmodified supplied citizen/admin apps on ports 5193/5194. Comparison screenshots are included in `output/original-ui-verification`.
