# BrightPath — AI-powered Career Guidance (Prototype)

This folder contains a small hackathon-ready prototype: a static frontend and a Flask backend that provides career recommendations and skill-gap analysis. The backend will attempt to load `model.joblib` from the repository root if present, otherwise it will fall back to a simple rule-based engine.

Quick start (local):

1. Backend (create venv and install):

```bash
cd brightpath/backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py
```

2. Frontend: open `brightpath/frontend/index.html` in a browser or serve with a static server:

```bash
cd brightpath/frontend
python3 -m http.server 8000
# then open http://localhost:8000
```

Example API request (curl):

```bash
curl -X POST http://localhost:5000/recommend \
  -H 'Content-Type: application/json' \
  -d '{"skills": ["python","data analysis"], "interests": ["ai","healthcare"], "education":"bachelors"}'
```

Sample response:

```json
{
  "recommendations": [
    {"career": "Data Analyst", "score": 0.85, "missing_skills": ["sql"]},
    {"career": "Machine Learning Engineer", "score": 0.6, "missing_skills": ["ml","tensorflow"]}
  ]
}
```

Files in this folder:
- `frontend/` — static HTML/CSS/JS (Landing, Profile input, Dashboard)
- `backend/` — Flask app and simple ML/model utilities
