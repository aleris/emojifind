import classes from './Search.module.scss'
import {useCallback, useState} from 'preact/hooks'
import type {EmojiData, EmojiItem} from '../../data/emojiData'
import {SearchBox, type Options} from '../SearchBox/SearchBox'
import {Groups} from '../Groups/Groups'
import {List} from '../List/List'

interface SearchProps {
  emojiData: EmojiData
  options: Options
  onOptionsChange: (options: Options) => void
  onCopy: (emoji: EmojiItem) => void
  onMouseEnterEmoji: (emoji: EmojiItem, element: HTMLElement) => void
  onMouseLeaveEmoji: () => void
  onShowDetails: (emoji: EmojiItem) => void
}

export function Search({
                         emojiData,
                         options,
                         onOptionsChange,
                         onCopy,
                         onMouseEnterEmoji,
                         onMouseLeaveEmoji,
                         onShowDetails,
                       }: SearchProps) {
  const [searchResults, setSearchResults] = useState<EmojiItem[]>([])

  const handleOnSearch = useCallback((text: string) => {
    const q = text.trim()
    if (q.length === 0) {
      setSearchResults([])
      return
    }
    const results = emojiData.searchIndex.search(q).slice(0, 300)
    const items = results.map(r => emojiData.emojiById.get(r.id)!)
    setSearchResults(items)
  }, [emojiData])


  return (
    <div class={classes.Search}>
      <header class={classes.header}>
        <div className={classes.title}>🎯 Emoji Find</div>
        <section className={classes.searchBox}>
          <SearchBox onSearch={handleOnSearch} onOptionsChange={onOptionsChange}/>
        </section>
      </header>
      <main class={classes.main}>
        <section className={classes.icons}>
          {searchResults.length === 0 ? (
            <Groups
              groups={emojiData.groups}
              options={options}
              onCopy={onCopy}
              onMouseEnterEmoji={onMouseEnterEmoji}
              onMouseLeaveEmoji={onMouseLeaveEmoji}
              onShowDetails={onShowDetails}
            />
          ) : (
            <List
              list={searchResults}
              options={options}
              onCopy={onCopy}
              onMouseEnterEmoji={onMouseEnterEmoji}
              onMouseLeaveEmoji={onMouseLeaveEmoji}
              onShowDetails={onShowDetails}
            />
          )}
        </section>

      </main>
    </div>
  )
}
