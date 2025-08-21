import {useEffect, useState} from 'preact/hooks'

const STORAGE_PREFIX = 'emoji-find-'

function getPrefixedKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = getPrefixedKey(key)

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const stored = window.localStorage.getItem(prefixedKey)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(prefixedKey, JSON.stringify(value))
    } catch {
      // ignore write errors (quota, privacy mode, etc.)
    }
  }, [prefixedKey, value])

  return [value, setValue] as const
}

export const storagePrefix = STORAGE_PREFIX


