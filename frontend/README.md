# SecureHR frontend

React + Vite. Talks to the FastAPI backend through the existing endpoints, with no backend changes needed.

## Run it (development)

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Start the API as usual (`uvicorn app.main:app --reload`, port 8000). The Vite dev server proxies
`/auth`, `/chat`, `/documents`, `/employees`, `/admin` to it, so there is no CORS setup.

## Run it from FastAPI (one port, good for Docker and the demo)

```bash
cd frontend && npm run build        # creates frontend/dist
```

Add to the **end** of `app/main.py`:

```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles

_dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"
if _dist.exists():
    app.mount("/", StaticFiles(directory=_dist, html=True), name="ui")
```

The UI is then served at http://127.0.0.1:8000/ and Swagger stays at /docs.

## Hosting the UI on a different origin

Set `VITE_API_URL=https://your-api` in `frontend/.env` and add `CORSMiddleware` to the API.

## Screens by role

| Role     | Screens                    |
| -------- | -------------------------- |
| employee | Assistant                  |
| manager  | Assistant                  |
| hr       | Assistant, Documents       |
| admin    | Assistant, Audit log       |

The UI only hides what a role cannot use. The backend still enforces every rule.

## Demo mode

`VITE_DEMO_MODE=true` (default) shows demo accounts on the login screen and a "Switch user"
control in the sidebar. Set it to `false` for anything that is not a demo.

## Replacing the Streamlit UI

Delete `frontend/app.py` and the `frontend` service in `docker-compose.yml`. With the static
mount above, the API container serves the UI and nothing else is needed.
