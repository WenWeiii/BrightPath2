import express from 'express'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import { getLatestSensor } from './firestoreMock'
import { predictWithVertex } from './vertexClient'

const app = express()
app.use(bodyParser.json())

app.get('/sensors', async (req, res) => {
  const latest = getLatestSensor()

  // Use real Vertex AI when configured, otherwise fall back to local mock endpoint.
  const useVertex = process.env.USE_VERTEX === 'true'
  let prediction = null

  try {
    if (useVertex) {
      const project = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
      const location = process.env.VERTEX_LOCATION || 'us-central1'
      const endpointId = process.env.VERTEX_ENDPOINT_ID
      if (!project || !endpointId) throw new Error('Missing Vertex configuration')
      // Instances shape depends on your model; here we send a simple feature vector.
      prediction = await predictWithVertex(project, location, endpointId, [[latest.temperature, latest.humidity]])
    } else {
      const vertexUrl = process.env.VERTEX_PREDICT_URL || 'http://localhost:8085/predict'
      const r = await fetch(vertexUrl, { method: 'POST', body: JSON.stringify({ sample: latest }), headers: { 'content-type': 'application/json' } })
      prediction = await r.json()
    }
  } catch (e) {
    prediction = { error: 'prediction-unavailable', details: String(e) }
  }

  res.json({ latest, prediction })
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Backend API listening on ${port}`))
