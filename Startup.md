# Starting VASTRIX locally and publishing it over ngrok

For this workstation, where Node, PostgreSQL and ngrok are portable copies in `.tooling/` rather
than system installs. All commands are PowerShell, run from the repository root.

Reserved ngrok domain: **`referee-drowsily-flanking.ngrok-free.dev`**

---

## One-time setup

Done once per machine.

### Save the ngrok authtoken

ngrok needs an account — there is no anonymous mode. Copy the token from
<https://dashboard.ngrok.com/get-started/your-authtoken>, then:

```powershell
.\.tooling\ngrok.exe config add-authtoken <your-token>
```

It is written to `%LOCALAPPDATA%\ngrok\ngrok.yml` and reused automatically from then on.

Run this command yourself rather than pasting the token into a chat or a file — it is a
credential, and this keeps it out of the repository.

Verify:

```powershell
.\.tooling\ngrok.exe config check
```

---

## Every time: start the site

```powershell
$env:Path = "$PWD\.tooling\node-v24.21.0-win-x64;$env:Path"
$env:NGROK_DOMAIN = "referee-drowsily-flanking.ngrok-free.dev"
npm run serve:public
```

The first line is needed in **every new terminal** — Node is not on the system PATH.

It prints:

```
  Public address: https://referee-drowsily-flanking.ngrok-free.dev
  Tunnel inspector: http://127.0.0.1:4040

  The site is live at https://referee-drowsily-flanking.ngrok-free.dev
```

Leave the terminal open. **Ctrl+C** stops the server and closes the tunnel together.

The first run builds, so it takes about a minute. Later runs skip the build and start in seconds,
because the reserved domain does not change.

### Why one command instead of three

`NEXT_PUBLIC_SITE_URL` is baked in at build time — canonical links, the sitemap and the JSON-LD all
carry it. Starting a tunnel and serving an existing build therefore publishes a site whose every
canonical points at `localhost`.

So [`scripts/serve-public.mjs`](scripts/serve-public.mjs) starts the tunnel first, asks it what
address it was given, rebuilds only if that address changed, and then serves. Forgetting the
rebuild is no longer possible.

Force a rebuild when the address has not changed but the content has:

```powershell
npm run serve:public --rebuild
```

---

## Optional: the backend

Only needed for the **contact form to accept a submission**. Without it every page still loads and
the form returns 502.

Two more terminals.

**Database:**

```powershell
.\.tooling\pgsql\bin\pg_ctl.exe -D .\.tooling\pgdata -l .\.tooling\pg.log start
```

**API:**

```powershell
$env:SECRET_KEY = "dev-only-secret-at-least-32-characters-long"
cd apps\api
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\uvicorn.exe app.main:app --port 8000
```

Check <http://localhost:8000/docs> lists the endpoints.

No SMTP server is configured, so nothing is emailed. Enquiries are recorded and the API reports
`notification_sent: false` — accurately, rather than claiming a send that did not happen.

---

## Shutting down

Ctrl+C in each terminal, then, if the database was started:

```powershell
.\.tooling\pgsql\bin\pg_ctl.exe -D .\.tooling\pgdata stop
```

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Missing script: "server:public"` | Typo | The script is `serve:public` |
| `node : not found` | PATH line skipped | Run it in *that* terminal |
| `ERR_NGROK_4018` | Authtoken not saved | Redo the one-time setup |
| `ERR_NGROK_105` | A dashboard resource ID was saved instead of the authtoken — IDs starting `rd_` (reserved domain) or `ak_` (API key) are not authtokens | Copy the long token from the authtoken page and save it again |
| `ERR_NGROK_3200` | `NGROK_DOMAIN` does not match the reserved domain | Copy it exactly from the dashboard |
| `ERR_NGROK_334` — "already online" | The domain is still being served by an earlier run. Closing a terminal does not always stop it | `Get-Process ngrok \| Stop-Process`, or stop the agent at <https://dashboard.ngrok.com/agents> |
| `EADDRINUSE` on 3000 | An older server is still running | `Get-Process node \| Stop-Process` |
| `EBUSY` during build | A server is holding the build directory | Stop it, then rebuild |
| Links point at `localhost` | Served without rebuilding | `npm run serve:public --rebuild` |
| Contact form returns 502 | The API is not running | See *Optional: the backend* |

---

## What this is, and is not

A preview served from a workstation: no TLS of its own, no monitoring, no backups, and it stops
when the machine sleeps. Two things to expect on ngrok's free tier — visitors see a one-time
interstitial page before the site, and `robots.txt` returns `Disallow: /`, so nothing is indexed
while placeholder content remains (see [`docs/dummy-data/`](docs/dummy-data/)).

Production is Docker Compose behind Nginx — see
[`docs/architecture/deployment.md`](docs/architecture/deployment.md).
