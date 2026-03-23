import { storage } from '../storage/mmkv'

export const markSeen = (id) => {
  storage.set(`seen_${id}`, true)
}

export const isSeen = (id) => {
  return storage.getBoolean(`seen_${id}`)
}

export const getSeenIds = () => {
  const keys = storage.getAllKeys()
  return keys
    .filter(k => k.startsWith('seen_'))
    .map(k => k.replace('seen_', ''))
}