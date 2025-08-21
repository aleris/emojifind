import classes from './Emoji.module.scss'
import type {EmojiItem} from '../../data/emojiData.ts'
import type {Options} from '../SearchBox/SearchBox.tsx'
import {useModifierKey} from '../../hooks/useModifierKey.ts'

type Params = {
  emoji: EmojiItem,
  onCopy: (emoji: EmojiItem) => void,
  onMouseEnter: (emoji: EmojiItem, element: HTMLElement) => void,
  onMouseLeave: () => void,
  onShowDetails?: (emoji: EmojiItem) => void,
  options: Options
}

export function Emoji({emoji, onCopy, onMouseEnter, onMouseLeave, onShowDetails, options}: Params) {
  const variants = emoji.variationBySkinTone.get(options.skinTone) ?? [emoji]

  const { isModifierPressed } = useModifierKey()

  const handleClick = (event: MouseEvent, variant: EmojiItem) => {
    // Check for command/ctrl key for details view
    if (isModifierPressed(event) && onShowDetails) {
      onShowDetails(variant)
    } else {
      onCopy(variant)
    }
  }

  return <>
    {variants.map(variant => (
      <div className={classes.Emoji}
           onClick={(event) => handleClick(event, variant)}
           onMouseEnter={element => onMouseEnter(variant, element.currentTarget)}
           onMouseLeave={onMouseLeave}>
        <span class={classes.icon}>{variant.emoji}</span>
      </div>
    ))}
  </>
}
