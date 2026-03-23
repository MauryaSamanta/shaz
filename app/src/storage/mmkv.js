import { MMKV } from 'react-native-mmkv'

let storageInstance = null

try {
  storageInstance = new MMKV()
  console.log("✅ MMKV initialized successfully")
} catch (e) {
  console.log("❌ MMKV INIT FAILED:", e)
}

export const storage = storageInstance