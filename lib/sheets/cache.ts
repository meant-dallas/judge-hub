export const ROLE_CACHE_TTL_MS = 5 * 60 * 1000   // 5 minutes
export const SHEET_CACHE_TTL_MS = 2 * 60 * 1000  // 2 minutes
export const CRITERIA_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()
