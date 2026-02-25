Contributions: this is a scaffold. To run locally:

1. Start the ML mock server:

```bash
python3 -m venv venv
. venv/bin/activate
pip install -r ml/requirements.txt flask joblib scikit-learn
python3 ml/train.py
python3 ml/predict.py
```

2. Start backend:

```bash
cd backend
npm install
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```
