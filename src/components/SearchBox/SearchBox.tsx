import classes from './SearchBox.module.scss'
import {useEffect, useRef, useState} from 'preact/hooks'
import {type TargetedEvent} from 'react'
import {SkinTone, type SkinToneType} from '../../data/emojiData.ts'
import {CopyFormat, type CopyFormatType} from '../../data/copy.ts'
import {useLocalStorage} from '../../hooks/useLocalStorage.ts'
import {SearchInput} from './SearchInput/SearchInput.tsx'

export interface Options {
  copyFormat: CopyFormatType;
  skinTone: SkinToneType;
}

export const DefaultOptions: Options = {
  copyFormat: CopyFormat.Emoji,
  skinTone: SkinTone.Light,
}

type Params = {
  onSearch: (text: string) => void;
  onOptionsChange: (options: Options) => void;
}

export function SearchBox({onSearch, onOptionsChange}: Params) {
  const [copyFormat, setCopyFormat] = useLocalStorage<CopyFormatType>('copy-format', DefaultOptions.copyFormat)
  const [skinTone, setSkinTone] = useLocalStorage<SkinToneType>('skin-tone', DefaultOptions.skinTone)
  const [query, setQuery] = useLocalStorage<string>('query', '')
  const [draftQuery, setDraftQuery] = useState(query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on initial mount as well
    inputRef.current?.focus()
  }, [])

  // Propagate options to parent whenever they change (including initial load)
  useEffect(() => {
    onOptionsChange({copyFormat, skinTone})
  }, [copyFormat, skinTone, onOptionsChange])

  // Propagate initial query on mount (load from localStorage)
  useEffect(() => {
    onSearch(query)
    // intentionally no dependencies: run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce persisting query to localStorage and triggering search
  useEffect(() => {
    if (draftQuery === query) return
    const timeoutId = setTimeout(() => {
      setQuery(draftQuery)
      onSearch(draftQuery)
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [draftQuery, query, setQuery, onSearch])

  function handleCopyFormatOnChange(event: TargetedEvent<HTMLSelectElement>) {
    const copyFormat = event.currentTarget.value as CopyFormatType
    setCopyFormat(copyFormat)
  }

  function handleSkinToneOnChange(event: TargetedEvent<HTMLSelectElement>) {
    const skinTone = event.currentTarget.value as SkinToneType
    setSkinTone(skinTone)
  }

  function handleClear() {
    setDraftQuery('')
    setQuery('')
    onSearch('')
  }

  return (
    <div class={classes.SearchBox}>
      <SearchInput query={draftQuery} onChange={setDraftQuery} onClear={handleClear}/>

      <div class={classes.options}>
        <span className={classes.label}>Copy Format:</span>
        <select
          class={classes.codeFormatSelect}
          value={copyFormat}
          onChange={handleCopyFormatOnChange}
        >
          <option value="Emoji" title="ex: 😊">Emoji</option>
          <optgroup label="Unicode">
            <option value={CopyFormat.UnicodeCodePoint} title="ex: U+1F60A">Unicode Code Point</option>
            <option value={CopyFormat.UnicodeDecimal} title="ex: 128522">Unicode Decimal</option>
          </optgroup>

          <optgroup label="HTML">
            <option value={CopyFormat.HTMLHexadecimal} title="ex: &amp;#x1F60A;">HTML Hexadecimal</option>
            <option value={CopyFormat.HTMLDecimal} title="ex: &amp;#128522;">HTML Decimal</option>
          </optgroup>
          <optgroup label="Java">
            <option value={CopyFormat.JavaUTF16Escape} title="ex: \uD83D\uDE0A">Java UTF-16 escape</option>
            <option value={CopyFormat.JavaInt} title="ex: 0x1F60A">Java int 32-bit</option>
          </optgroup>
        </select>
        <span className={classes.label}>Skin Tone:</span>
        <select
          class={classes.skinToneSelect}
          disabled={copyFormat !== 'Emoji'}
          value={skinTone}
          onChange={handleSkinToneOnChange}
        >
          <option value={SkinTone.Default}>-</option>
          <option value={SkinTone.Light}>🏻</option>
          <option value={SkinTone.MediumLight}>🏼</option>
          <option value={SkinTone.Medium}>🏽</option>
          <option value={SkinTone.MediumDark}>🏾</option>
          <option value={SkinTone.Dark}>🏿</option>
        </select>
      </div>
    </div>
  )
}
