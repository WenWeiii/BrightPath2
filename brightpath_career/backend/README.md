# Backend (Flask) for BrightPath

This backend exposes two endpoints:

- `POST /recommend` — accepts JSON with `skills` (array), `interests` (array), `education` (string) and returns `recommendations`, `skill_gaps`, and `suggested_resources`.
- `POST /analyze-skills` — accepts `skills` array and returns coverage and gaps for known careers.

Example request:

```json
POST /recommend
{
  "skills": ["python", "data analysis"],
  "interests": ["healthcare"],
  "education": "Bachelor"
}
```

Example response (abridged):

```json
{
  "recommendations": [
    {"title":"Data Analyst", "score":0.8, "missing":["sql"]}
  ],
  "skill_gaps": ["sql"],
  "suggested_resources": ["Intro to SQL - example link"]
}
```
