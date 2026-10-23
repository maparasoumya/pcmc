# Vercel deployment for PCMC CAP

## Three projects, one database and one file store

- Backend project root: `CAP-BACKEND` (native Django).
- Citizen and staff project root: `pcmc-cap-platform` for **both**, so the shared code is included.
- Database: hosted PostgreSQL (for example Neon through Vercel Marketplace). Use SSL and a pooled runtime URL.
- Media: an S3-compatible bucket (Cloudflare R2, AWS S3 or Tigris) with a public HTTPS bucket/CDN origin. Files are public website assets; citizen messages and staff notes remain in the private database/inbox, not in the bucket.

New service accounts, plan selection and credentials must be supplied through the providers. Do not place credentials in frontend variables or source control. Keep private values in Vercel Environment Variables or an ignored backend `.env.local` file. Only `VITE_API_URL` belongs in the frontend environment.

## 1. Provision the database and bucket

Use Vercel Marketplace to create/connect a PostgreSQL resource to the backend project. Start with the provider's free plan if suitable; no paid service is required by this code. Save its `DATABASE_URL` in backend project variables. Use a separate database/branch for preview deployments.

For S3-compatible storage, create a bucket and a bucket-scoped key with PutObject/GetObject/HeadObject permissions. Configure a public bucket domain or CDN domain. Fill the `S3_*` variables from `CAP-BACKEND/.env.production.example`. For R2, use its S3 endpoint and `S3_REGION=auto`; for AWS, omit `S3_ENDPOINT_URL` and use the bucket's region. For Tigris, use the endpoint and region supplied by its integration. These credentials stay on the backend.

Configure the bucket CORS policy using `pcmc-cap-platform/deployment/storage-cors.example.json`, replacing the example admin origin with your actual staff site URL. Only the admin site uploads files. Allow PUT, GET and HEAD with Content-Type and Content-Length. Public GET access or the public CDN origin must be configured separately from CORS.

The direct upload flow is staff API -> short-lived signed PUT URL -> browser uploads directly to storage -> backend verifies object size, MIME type and file header -> asset URL is saved. File bytes do not pass through a Vercel Function, so the application's 10 MB limit is retained. An upload URL expires after ten minutes and is bound to its staff account, file size, key and content type.

## 2. Backend settings and database initialization

Add all variables listed in `CAP-BACKEND/.env.production.example` to Vercel. Generate a secret locally:

```sh
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Use the actual backend hostname in `DJANGO_ALLOWED_HOSTS`, both frontend HTTPS origins in `DJANGO_CORS_ORIGINS`, and the backend/admin origins in `DJANGO_CSRF_TRUSTED_ORIGINS`. Exact Vercel deployment hostnames are also allowed through Vercel's injected variables. The code refuses production startup with SQLite, debug mode, missing secret or local media storage.

Install updated dependencies and put the same production variables in an ignored `CAP-BACKEND/.env.local`. These override local development defaults. Use a **direct/unpooled database connection** for the release command if your PostgreSQL provider requires it for schema changes; use the pooled connection on Vercel.

```sh
cd CAP-BACKEND
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py prepare_release
.venv/bin/python manage.py createsuperuser
```

The release command validates production settings, applies migrations and imports the eight original sectors without overwriting edits. It does not copy an existing SQLite database. Existing real records must be exported/imported separately if you have already collected them; keep a backup and use an empty target database for the transfer. No migrations or user creation are run automatically by preview builds.

### Preserve existing local records

Before changing local database settings, stop new submissions briefly and back up SQLite and the media directory. From the existing local configuration:

```sh
.venv/bin/python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --exclude sessions --exclude authtoken --exclude admin.logentry --output /PRIVATE/PATH/pcmc-data.json
```

Keep that export outside the repository because it contains citizen details and password hashes. After loading production variables, initialize an **empty** PostgreSQL database with:

```sh
.venv/bin/python manage.py prepare_release --skip-seed
.venv/bin/python manage.py loaddata /PRIVATE/PATH/pcmc-data.json
.venv/bin/python manage.py import_portal_content
```

Existing users retain their password hashes and staff flags but must sign in again. Local files must also be copied to the cloud bucket using the same `uploads/...` keys, and old local media URLs in publication content must be replaced with the configured public bucket origin. The database export alone does not copy file bytes. Do not delete the local backups until the hosted application has been checked.

To continue local development with SQLite, move/rename the production `.env.local` or explicitly export local overrides before running the development server.

## 3. Deploy the backend

In Vercel import your repository with Root Directory `CAP-BACKEND`. Framework is Django, with `backend.wsgi.application` as the native entrypoint. The provided `vercel.json` runs deployment checks; Vercel collects static files from `STATIC_ROOT` and serves them from its CDN. Do not run Django's development server on Vercel.

Or deploy from that directory using an authenticated CLI:

```sh
vercel link
vercel deploy --prod
```

Test `https://YOUR_BACKEND/api/health/`; it must return `{"status":"ok"}`. Verify `https://YOUR_BACKEND/admin/login/` loads its stylesheet.

## 4. Deploy each frontend

Create **two separate Vercel projects** with Root Directory `pcmc-cap-platform`.

Both projects use the supplied `pcmc-cap-platform/vercel.json`. No source edits or custom configuration path are needed.

| Setting | Citizen portal | Staff panel |
|---|---|---|
| Framework preset | Other | Other |
| Root Directory | `pcmc-cap-platform` | `pcmc-cap-platform` |
| Environment variable | `PCMC_APP=citizen` | `PCMC_APP=admin` |
| Environment variable | `VITE_API_URL=https://YOUR_BACKEND/api` | same |

The common build script selects the appropriate app, builds it and copies its generated output to `dist`. Static files are served first and unknown paths fall back to `index.html`, so direct links to React routes work. Use separate Vercel project IDs when deploying the same directory from the CLI. Advanced single-app config templates are also in `deployment/`, but are not required for this setup.

After final URLs are known, update backend CORS/CSRF origins and redeploy the backend. Changes to `VITE_API_URL` require rebuilding each frontend. Production frontends never silently fall back to localhost.

## 5. Where staff read citizen responses

1. A citizen submits **Share a suggestion** or **Ask a query** under Get Involved.
2. The backend saves it to PostgreSQL through `POST /api/submissions/`.
3. Staff sign in at the staff site, then open **Suggestions & Queries** (`/suggestions`).
4. Filter by response type or review status, search the name/subject/message, then choose **Edit** to read the full entry.
5. Update New / Under review / Responded / Archived, enter internal notes and save.

Private inbox reads and updates require staff access. Selecting Responded records a status; it does not send email. Use Refresh inbox to retrieve new submissions.

## 6. Launch checks

- Staff login/logout and protected routes work over HTTPS.
- Submit one clearly labelled test query and suggestion, confirm both appear in the staff inbox, then remove the tests.
- Upload an image/PDF larger than 4.5 MB and smaller than 10 MB; verify it displays after redeployment.
- Publish one draft and confirm the citizen portal updates; drafts are not exposed.
- Confirm uploaded files survive deployment and database records persist.
- Set backup/retention policies in the database and storage provider.

## Verification commands

```sh
cd CAP-BACKEND
.venv/bin/python manage.py test publishing
.venv/bin/python manage.py collectstatic --noinput
cd ../pcmc-cap-platform
npm run build
npm run lint
```

Automated tests mock cloud storage for validation and permissions. A real PostgreSQL connection, provider bucket CORS and signed upload must also be verified against the provisioned services before the deployment is called live.
