import { GoogleAuth } from 'google-auth-library'
import fetch from 'node-fetch'

/**
 * Call a Vertex AI endpoint using REST and Application Default Credentials.
 * Expects endpoint in format: projects/{project}/locations/{location}/endpoints/{endpoint}
 */
export async function predictWithVertex(project: string, location: string, endpointId: string, instances: any[]) {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = (typeof tokenResponse === 'string') ? tokenResponse : tokenResponse?.token
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/endpoints/${endpointId}:predict`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ instances })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Vertex predict failed: ${res.status} ${txt}`)
  }
  return res.json()
}
