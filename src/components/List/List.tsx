import classes from './List.module.scss'
import type {EmojiItem} from '../../data/emojiData.ts'
import {Emoji} from '../Emoji/Emoji.tsx'
import type {Options} from '../SearchBox/SearchBox.tsx'

type Params = {
  list: EmojiItem[],
  onCopy: (emoji: EmojiItem) => void,
  onMouseEnterEmoji: (emoji: EmojiItem, element: HTMLElement) => void,
  onMouseLeaveEmoji: (emoji: EmojiItem) => void,
  onShowDetails?: (emoji: EmojiItem) => void,
  options: Options
}

export function List({list, onCopy, onMouseEnterEmoji, onMouseLeaveEmoji, onShowDetails, options}: Params) {
  const handleOnCopy = (emoji: EmojiItem) => {
    onCopy(emoji)
  }
  return (
    <div class={classes.List}>
      {list.map(emoji => (
        <Emoji
          key={emoji.emoji}
          emoji={emoji}
          options={options}
          onCopy={handleOnCopy}
          onMouseEnter={(emoji, element) => onMouseEnterEmoji(emoji, element)}
          onMouseLeave={() => onMouseLeaveEmoji(emoji)}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  )
}
