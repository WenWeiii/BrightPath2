import React from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const { data } = useSWR('/api/sensors', fetcher, { refreshInterval: 5000 })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial' }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          alignItems: 'center'
        }}
      >
        <a href="/" style={{ fontWeight: 700, color: '#1f4ea8' }}>
          Dashboard
        </a>
        <a
          href="/games"
          style={{
            fontWeight: 700,
            color: '#ffffff',
            background: '#2f7bf6',
            padding: '6px 10px',
            borderRadius: 8,
            textDecoration: 'none'
          }}
        >
          Explore Career Games
        </a>
      </nav>
      <h1>BrightPath Dashboard (Demo)</h1>
      <p>Shows sample sensor readings and air-quality predictions.</p>
      <p>
        Try the role-based mini games at <a href="/games">/games</a>.
      </p>
      <section>
        <h2>Latest Sensors</h2>
        <pre>{JSON.stringify(data?.latest || {}, null, 2)}</pre>
      </section>
    </main>
  )
}
