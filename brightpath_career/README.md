# BrightPath (Career Guidance) - Hackathon Prototype

This small app demonstrates a web-based AI-powered career guidance prototype.

Structure
- `frontend/` — simple HTML/CSS/JS pages (landing, profile input, dashboard)
- `backend/` — Flask REST API with endpoints `/recommend` and `/analyze-skills`

Quick start (local)

1. Create a Python virtual environment and install backend requirements:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Run the backend API:

```bash
cd backend
python app.py
```

3. Open the frontend pages in your browser (serve static files with a simple HTTP server or open `frontend/index.html` directly):

```bash
# from repository root
python3 -m http.server 8000 --directory brightpath_career/frontend
# then open http://localhost:8000/index.html
```

Example API request/response and notes are in `backend/README.md`.

## Firebase (optional, hackathon-safe)

The frontend includes a minimal Firebase Web SDK + Firestore integration for:

- Student profile storage
- Career recommendation result storage

No auth is required. Data is stored by a browser-local session id.

Setup:

1. Create a Firebase project and enable Firestore Database.
2. Open `frontend/js/firebase-config.js` and fill in your Firebase web config values.
3. Run the app normally.

Behavior:

- If Firebase config is missing, SDK fails to load, or Firestore calls fail, the app continues using localStorage.
- Firestore collections used:
	- `studentProfiles`
	- `careerRecommendations`

### Quick local Firebase test

Use this checklist to verify cloud persistence end-to-end:

1. Start backend and frontend locally (see Quick start above).
2. Add real values in `frontend/js/firebase-config.js`.
3. Open `http://localhost:8000/profile.html` and submit a profile.
4. Confirm dashboard shows `Firebase connected`.
5. In Firebase Console -> Firestore -> Data, verify docs appear in:
	 - `studentProfiles/{sessionId}`
	 - `careerRecommendations/{sessionId}`
6. Reload dashboard and confirm results still render.
7. (Fallback check) Temporarily clear `projectId` in config, reload dashboard, and verify:
	 - status shows `Local-only mode`
	 - app still works from localStorage

### Firestore rules (hackathon prototype)

For this prototype with no authentication, use short-lived permissive rules during demo/hackathon only:

- Versioned file in this repo: `firestore.rules`

```text
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /studentProfiles/{docId} {
			allow read, write: if true;
		}
		match /careerRecommendations/{docId} {
			allow read, write: if true;
		}
	}
}
```

Important:

- These rules are intentionally open and not production-safe.
- For production, add Firebase Authentication and restrict document access per user.

### Deploy rules with Firebase CLI

This folder includes:

- `firebase.json` (points Firestore rules to `firestore.rules`)
- `.firebaserc` (default Firebase project id placeholder)

Steps:

1. Install Firebase CLI (if needed): `npm install -g firebase-tools`
2. Login: `firebase login`
3. Set your project id in `.firebaserc` (replace `your-firebase-project-id`)
4. Deploy rules from this folder:

```bash
cd brightpath_career
firebase deploy --only firestore:rules
```