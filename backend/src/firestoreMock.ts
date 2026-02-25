/**
 * Small Firestore mock for local development. Replace with real Firestore client in production.
 */
export function getLatestSensor() {
  return {
    temperature: 22.5,
    humidity: 56,
    pm25: 12.4,
    timestamp: new Date().toISOString()
  }
}

// Example real-firestore usage (commented):
// import { Firestore } from '@google-cloud/firestore'
// const db = new Firestore()
// export async function getLatestSensor() {
//   const snap = await db.collection('sensors').orderBy('timestamp', 'desc').limit(1).get()
//   return snap.docs[0]?.data()
// }
