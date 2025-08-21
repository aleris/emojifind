import classes from './SearchInput.module.scss'
import {useEffect, useRef} from 'preact/hooks'

type Params = {
  query: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

export function SearchInput({query, onChange, onClear}: Params) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on initial mount
    inputRef.current?.focus()
  }, [])

  return (
    <div className={classes.SearchInput}>
      <input
        name="search"
        type="text"
        className={classes.input}
        placeholder="Search"
        value={query}
        ref={inputRef}
        onInput={event => {
          const value = event.currentTarget.value
          onChange(value)
        }}
        onKeyDown={event => {
          if (event.key === 'Escape' && query.length > 0) {
            event.preventDefault()
            onClear()
          }
        }}
        tabIndex={1}
        autoFocus={true}
      />
      {query.length > 0 && (
        <button
          type="button"
          className={classes.clearButton}
          aria-label="Clear Search"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </div>
  )
}
