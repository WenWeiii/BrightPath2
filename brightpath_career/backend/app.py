import os

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

"""BrightPath backend - simple Flask API for career recommendations.

Endpoints:
- POST /recommend
- POST /analyze-skills

This is intentionally simple and suitable for a hackathon prototype.
"""

app = Flask(__name__)
CORS(app)

# Try to load a model if present (optional); otherwise fallback to rule-based logic
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model.joblib')
model = None
try:
    model = joblib.load(MODEL_PATH)
    # model can be used if it's trained for career scoring
except Exception:
    model = None


# Minimal career database for demo purposes
CAREERS = {
    'Data Analyst': {
        'skills': {'python', 'sql', 'data analysis', 'excel'},
        'resources': ['Intro to SQL', 'Pandas DataCamp', 'Coursera Data Analysis']
    },
    'Software Engineer': {
        'skills': {'programming', 'algorithms', 'data structures', 'git'},
        'resources': ['CS50', 'LeetCode', 'Git & GitHub']
    },
    'UX Designer': {
        'skills': {'design', 'prototyping', 'user research', 'figma'},
        'resources': ['Interaction Design Foundation', 'Figma docs']
    },
    'Healthcare Analyst': {
        'skills': {'statistics', 'python', 'healthcare domain knowledge'},
        'resources': ['Health Data Science', 'Intro to Biostatistics']
    }
}


def normalize_list(items):
    return {str(i).strip().lower() for i in items} if items else set()


def recommend_careers(skills, interests, education, top_k=5):
    """Simple rule-based matcher.

    Scores careers by fraction of required skills matched.
    `interests` and `education` are kept in the signature for future extension.
    """
    _ = interests, education
    user_skills = normalize_list(skills)
    results = []
    for title, meta in CAREERS.items():
        required = {s.lower() for s in meta['skills']}
        matched = user_skills & required
        score = len(matched) / max(1, len(required))
        missing = sorted(list(required - user_skills))
        results.append(
            {
                'title': title,
                'score': score,
                'missing': missing,
                'resources': meta.get('resources', []),
            }
        )
    results.sort(key=lambda r: r['score'], reverse=True)
    return results[:top_k]


def analyze_skill_gaps(recommendations):
    # Aggregate missing skills across top recommendations
    gaps = set()
    for r in recommendations:
        gaps.update(r.get('missing', []))
    return sorted(list(gaps))


@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json() or {}
    skills = data.get('skills', [])
    interests = data.get('interests', [])
    education = data.get('education', '')

    # If a trained model is available, you could translate skills -> features -> model.predict
    # For this prototype we use the rule-based matcher above.
    recs = recommend_careers(skills, interests, education, top_k=10)
    gaps = analyze_skill_gaps(recs[:3])

    response = {
        'recommendations': recs,
        'skill_gaps': gaps,
        'suggested_resources': list({res for r in recs for res in r.get('resources', [])})
    }
    return jsonify(response)


@app.route('/analyze-skills', methods=['POST'])
def analyze_skills():
    data = request.get_json() or {}
    skills = data.get('skills', [])
    user_skills = normalize_list(skills)
    coverage = []
    for title, meta in CAREERS.items():
        required = {s.lower() for s in meta['skills']}
        matched = sorted(list(user_skills & required))
        missing = sorted(list(required - user_skills))
        coverage.append(
            {
                'career': title,
                'matched': matched,
                'missing': missing,
                'match_percent': len(matched) / max(1, len(required)),
            }
        )
    coverage.sort(key=lambda c: c['match_percent'], reverse=True)
    return jsonify({'coverage': coverage})


if __name__ == '__main__':
    # Run dev server
    app.run(host='0.0.0.0', port=5000, debug=True)
