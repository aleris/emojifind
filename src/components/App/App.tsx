import {useCallback, useState} from 'preact/hooks'
import '../../data/emojiData.ts'
import {useEffect} from 'react'
import {load, type EmojiData, type EmojiItem} from '../../data/emojiData.ts'
import {Details} from '../Details/Details.tsx'
import {Search} from '../Search/Search.tsx'
import {DefaultOptions, type Options} from '../SearchBox/SearchBox.tsx'
import {formatCopiedText} from '../../data/copy.ts'
import {Tooltip} from '../Tooltip/Tooltip.tsx'

const BASE = (import.meta as any).env?.BASE_URL ?? '/'
function withBase(path = '') {
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${b}/${p}`
}
function fromBase(pathname: string) {
  let b = BASE
  if (!b.startsWith('/')) b = '/' + b
  if (!b.endsWith('/')) b += '/'
  if (pathname === b || pathname === b.slice(0, -1)) return ''
  if (pathname.startsWith(b)) return pathname.slice(b.length)
  if (pathname.startsWith('/')) return pathname.slice(1)
  return pathname
}

export function App() {
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null)
  const [detailsEmoji, setDetailsEmoji] = useState<EmojiItem | null>(null)
  const [options, setOptions] = useState<Options>(DefaultOptions)
  const [copiedEmoji, setCopiedEmoji] = useState<EmojiItem | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiItem | null>(null)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  const handleOnCopy = useCallback(async (emoji: EmojiItem) => {
    const textToCopy = formatCopiedText(emoji, options)
    await navigator.clipboard.writeText(textToCopy)
    setCopiedEmoji(emoji)
    setCopiedText(textToCopy)
  }, [options])

  let lastMouseLeaveTimoutId = -1
  const handleOnMouseEnterEmoji = useCallback((emoji: EmojiItem, element: HTMLElement) => {
    clearTimeout(lastMouseLeaveTimoutId)
    setHoveredEmoji(emoji)
    setHoveredElement(element)
  }, [])

  const handleOnMouseLeaveEmoji = useCallback(() => {
    lastMouseLeaveTimoutId = setTimeout(() => { // add a small delay so it does not flicker on repeated hovers
      setHoveredEmoji(null)
    }, 250)
  }, [])

  useEffect(() => {
    const emojiData = load()
    setEmojiData(emojiData)
  }, [])

  // Handle URL routing for emoji details
  useEffect(() => {
    const handlePopState = () => {
      const rel = fromBase(window.location.pathname)
      if (rel === '') {
        setDetailsEmoji(null)
      } else if (emojiData) {
        const id = decodeURIComponent(rel)
        const emoji = emojiData.emojiById.get(id)
        if (emoji) {
          setDetailsEmoji(emoji)
        } else {
          // Invalid emoji, redirect to home
          window.history.replaceState(null, '', withBase())
          setDetailsEmoji(null)
        }
      }
    }

    // Handle initial load
    handlePopState()

    // Listen for browser back/forward
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [emojiData])

  const handleOnOptionsChange = useCallback((options: Options) => {
    setOptions(options)
  }, [])

  const handleShowDetails = useCallback((emoji: EmojiItem) => {
    setDetailsEmoji(emoji)
    setHoveredEmoji(null)
    setHoveredElement(null)
    window.history.pushState(null, '', withBase(encodeURIComponent(emoji.id)))
  }, [])

  const handleCloseDetails = useCallback(() => {
    setDetailsEmoji(null)
    setHoveredEmoji(null)
    setHoveredElement(null)
    window.history.pushState(null, '', withBase())
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[placeholder="Search"]')
      input?.focus()
    }, 0)
  }, [])

  if (emojiData === null) {
    return <small>Loading...</small>
  }

  return <>
    {detailsEmoji
      ? (
        <Details
          emoji={detailsEmoji}
          emojiData={emojiData}
          options={options}
          onCopy={handleOnCopy}
          onMouseEnterEmoji={handleOnMouseEnterEmoji}
          onMouseLeaveEmoji={handleOnMouseLeaveEmoji}
          onShowDetails={handleShowDetails}
          onClose={handleCloseDetails}
        />
      )
      : (
        <Search
          emojiData={emojiData}
          options={options}
          onOptionsChange={handleOnOptionsChange}
          onCopy={handleOnCopy}
          onMouseEnterEmoji={handleOnMouseEnterEmoji}
          onMouseLeaveEmoji={handleOnMouseLeaveEmoji}
          onShowDetails={handleShowDetails}
        />
      )
    }
    {hoveredEmoji !== null && hoveredElement !== null ? (
      <Tooltip
        emoji={hoveredEmoji}
        copiedText={copiedText}
        element={hoveredElement}
        copied={copiedEmoji === hoveredEmoji}
        options={options}
      />
    ) : null}
  </>
}
