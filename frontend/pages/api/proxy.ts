import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Proxy to backend API container running on localhost:8080 during local dev.
  const backend = process.env.BACKEND_URL || 'http://localhost:8080'
  const path = req.query.path || ''
  const url = `${backend}/${path}`
  const backendRes = await fetch(url)
  const body = await backendRes.text()
  res.status(backendRes.status).send(body)
}
