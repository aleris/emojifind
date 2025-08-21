import { useState, useEffect } from 'preact/hooks'
import type { EmojiItem } from '../data/emojiData'

interface EmojiDescription {
  text: string
  uses: string[]
}
interface UseEmojiDescriptionResult {
  description: EmojiDescription | null
  loading: boolean
  error: string | null
}

export function useEmojiDescription(emoji: EmojiItem): UseEmojiDescriptionResult {
  const [description, setDescription] = useState<EmojiDescription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const loadDescription = async () => {
      if (!emoji?.emoji) return

      setLoading(true)
      setError(null)
      setDescription(null)

      try {
        const base = import.meta.env.BASE_URL ?? '/'
        const url = `${base}desc/${encodeURIComponent(emoji.emoji)}.txt`
        const response = await fetch(url)

        if (!response.ok) {
          if (response.status === 404) {
            setError('No description available for this emoji.')
            setDescription(null)
          } else {
            setError(`Failed to load description: ${response.status} ${response.statusText}`)
            setDescription(null)
          }
          return
        }

        const text = await response.text()
        const parts = text.split('#')
        const description = parts[0].trim()
        const uses = parts[1]?.trim()?.split('\n')
          .map(line => line.trim().replace(/^-\s+/, ''))
          .filter(line => line.length > 0)
          ?? []
        
        if (!isCancelled) {
          setDescription({ text: description, uses })
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load description')
          setDescription(null)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadDescription()

    return () => {
      isCancelled = true
    }
  }, [emoji?.emoji])

  return { description, loading, error }
}
