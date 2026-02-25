import React from 'react'

export default function GamesPage() {
  return (
    <main style={{ height: '100vh', margin: 0 }}>
      <iframe
        title="BrightPath Career Mini Games"
        src="/mini-games/index.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </main>
  )
}
