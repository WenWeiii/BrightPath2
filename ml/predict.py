"""Local prediction server to mock Vertex AI endpoint for development."""
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load model at import time for simplicity in this demo.
try:
    model = joblib.load('model.joblib')
except Exception:
    model = None


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    if model is None:
        return jsonify({'error': 'no-model'}), 500
    sample = data.get('sample', {})
    features = [[sample.get('temperature', 20), sample.get('humidity', 50)]]
    pred = model.predict(features).tolist()
    return jsonify({'prediction': pred})


if __name__ == '__main__':
    app.run(port=8085)
