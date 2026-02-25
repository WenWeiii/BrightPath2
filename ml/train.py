"""Sample Vertex AI training script (local demo).
This script trains a tiny model and saves it for demonstration.
"""
from sklearn.linear_model import LinearRegression
import numpy as np
import joblib

X = np.array([[10,40],[12,50],[14,60],[16,70]])
y = np.array([20,22,24,26])
model = LinearRegression().fit(X,y)
joblib.dump(model, 'model.joblib')
print('Saved model.joblib')
