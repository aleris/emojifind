import classes from './Groups.module.scss'
import {List} from '../List/List.tsx'
import type {EmojiItem, Group} from '../../data/emojiData.ts'
import type {Options} from '../SearchBox/SearchBox.tsx'

type Params = {
  groups: Group[],
  onCopy: (emoji: EmojiItem) => void,
  onMouseEnterEmoji: (emoji: EmojiItem, element: HTMLElement) => void,
  onMouseLeaveEmoji: (emoji: EmojiItem) => void,
  onShowDetails?: (emoji: EmojiItem) => void,
  options: Options
}

export function Groups({groups, onCopy, onMouseEnterEmoji, onMouseLeaveEmoji, onShowDetails, options}: Params) {
  const handleOnCopy = (emoji: EmojiItem) => {
    onCopy(emoji)
  }
  return (
    <div class={classes.Groups}>
      {groups.map(group => (
        <div key={group.name} class={classes.group}>
          <h2 class={classes.groupName}>{group.name}</h2>
          <div class={classes.groupContent}>
            {
              group.subgroups.map(subgroup => (
                <div key={subgroup.name} class={classes.subgroup}>
                  <h3 class={classes.subgroupName}>{subgroup.name}</h3>
                  <div class={classes.subgroupContent}>
                    <List
                      list={subgroup.emojis.filter(emoji => !emoji.hasSkinToneModifier)}
                      options={options}
                      onCopy={handleOnCopy}
                      onMouseEnterEmoji={onMouseEnterEmoji}
                      onMouseLeaveEmoji={onMouseLeaveEmoji}
                      onShowDetails={onShowDetails}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  )
}
