import classes from './Tooltip.module.scss'
import type {EmojiItem} from '../../data/emojiData.ts'
import {useRef} from 'preact/hooks'
import type {Options} from '../SearchBox/SearchBox.tsx'
import {useTooltipPosition} from '../../hooks/useTooltipPosition.ts'
import {useEmojiDescription} from '../../hooks/useEmojiDescription.ts'
import {useModifierKey} from '../../hooks/useModifierKey.ts'

type Params = {
  emoji: EmojiItem,
  element: HTMLElement,
  copied: boolean,
  copiedText: string | null,
  options: Options
}

export function Tooltip({emoji, element, copied, copiedText}: Params) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  const mainItem = emoji.variationOf ?? emoji

  const { description, loading } = useEmojiDescription(mainItem)

  const position = useTooltipPosition({
    targetElement: element,
    tooltipRef,
    dependencies: [emoji, copied, loading]
  })

  const { modifierKeyLabel } = useModifierKey()

  if (description === null) { // delay showing the tooltip until the description is loaded
    return null
  }

  return (
    <div
      ref={tooltipRef}
      className={classes.Tooltip}
      style={{top: `${position.y}px`, left: `${position.x}px`}}
    >
      <div className={classes.title}>{emoji.title}</div>
      
      <div className={classes.actions}>
        <div className={classes.copy}>
          {copied
            ? (
              <span className={classes.copied}>
                <span>
                  <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="check"
                       className="svg-inline--fa fa-check" role="img" xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 448 512"><path fill="currentColor"
                                                   d="M441 103c9.4 9.4 9.4 24.6 0 33.9L177 401c-9.4 9.4-24.6 9.4-33.9 0L7 265c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l119 119L407 103c9.4-9.4 24.6-9.4 33.9 0z"></path></svg>
                </span>
                <span>Copied: {copiedText ?? ''}</span>
              </span>
            )
            : (
              <span className={classes.info}>
                <span>
                <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="copy"
                     className="svg-inline--fa fa-copy " role="img" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 448 512"><path fill="currentColor"
                                                 d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"></path></svg>
                </span>
                <span>Click to copy</span>
              </span>
            )
          }
        </div>
        <div className={classes.details}>
          <span>{modifierKeyLabel} + Click for details</span>
        </div>
      </div>

      <div className={classes.description}>
        {loading ? (
          <span class={classes.loading}>Loading description...</span>
        ) : description !== null ? (
          <div>
            <p className={classes.text}>{description.text}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
