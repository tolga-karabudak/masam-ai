const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
    data: T
    ts: number
    ttl: number
}

export function getCached<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
        const raw = localStorage.getItem(`masam_${key}`)
        if (!raw) return null
        const entry: CacheEntry<T> = JSON.parse(raw)
        if (Date.now() - entry.ts > entry.ttl) {
            localStorage.removeItem(`masam_${key}`)
            return null
        }
        return entry.data
    } catch {
        return null
    }
}

export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
    if (typeof window === "undefined") return
    try {
        const entry: CacheEntry<T> = { data, ts: Date.now(), ttl }
        localStorage.setItem(`masam_${key}`, JSON.stringify(entry))
    } catch {
        // localStorage full or unavailable
    }
}

export function clearCache(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(`masam_${key}`)
}

export function clearAllCache(): void {
    if (typeof window === "undefined") return
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("masam_"))
    for (const k of keys) localStorage.removeItem(k)
}
