import {useState, useEffect} from 'preact/hooks'
import classes from './Details.module.scss'
import {type EmojiItem, type EmojiData, SkinTone} from '../../data/emojiData'
import {useEmojiDescription} from '../../hooks/useEmojiDescription'
import type {Options} from '../SearchBox/SearchBox'
import {List} from '../List/List.tsx'
import {CopyFormat, formatCopiedText} from '../../data/copy.ts'

interface DetailsProps {
  emoji: EmojiItem
  emojiData: EmojiData
  options: Options
  onCopy: (emoji: EmojiItem) => void
  onMouseEnterEmoji: (emoji: EmojiItem, element: HTMLElement) => void
  onMouseLeaveEmoji: () => void
  onShowDetails: (emoji: EmojiItem) => void
  onClose: () => void
}

export function Details({
                          emoji,
                          emojiData,
                          options,
                          onCopy,
                          onMouseEnterEmoji,
                          onMouseLeaveEmoji,
                          onShowDetails,
                          onClose,
                        }: DetailsProps) {
  const mainItem = emoji.variationOf ?? emoji
  const {description, loading, error} = useEmojiDescription(mainItem)
  const [relatedEmojis, setRelatedEmojis] = useState<EmojiItem[]>([])

  useEffect(() => {
    // Search for related emojis using title and keywords
    const searchQuery = mainItem.title.toLowerCase() + ' ' + mainItem.keywords.slice(0, 5).join(' ') // Use first keywords
    const results = emojiData.searchIndex.search(searchQuery)

    const relatedItems = results
      .map(r => emojiData.emojiById.get(r.id)!)
      .filter(item => item.emoji !== emoji.emoji) // Exclude current emoji
      .slice(0, 25) // Limit related emojis

    setRelatedEmojis(relatedItems)
  }, [emoji, emojiData])

  useEffect(() => {
    // Handle escape key to go back to search page
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={classes.Details}>
      <div className={classes.content}>
        <header className={classes.header}>
          <div className={classes.emojiDisplay}>
            <span className={classes.largeEmoji}>{emoji.emoji}</span>
            <div className={classes.basicInfo}>
              <h1 className={classes.title}>{emoji.title}</h1>
              <div className={classes.metadata}>
                <span className={classes.group}>{emoji.group}</span>
                {emoji.subgroup !== emoji.group ? (
                  <>
                    <span className={classes.separator}>•</span>
                    <span className={classes.subgroup}>{emoji.subgroup}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <button className={classes.closeButton} onClick={onClose} aria-label="Back to search">
            ✕
          </button>
        </header>

        <main className={classes.main}>
          <section className={classes.section}>
            <h2 className={classes.sectionTitle}>Description</h2>
            <div className={classes.description}>
              {loading ? <small className={classes.loading}>Loading...</small> : null}
              {error ? <p className={classes.error}>{error}</p> : null}
              {description ? (
                <div>
                  <p className={classes.descriptionText}>{description.text}</p>
                  {description.uses.length > 0 ? (
                    <div className={classes.useCases}>
                      <h3 className={classes.sectionTitle}>Common uses:</h3>
                      <ul className={classes.useCasesList}>
                        {description.uses.map((use, index) => (
                          <li key={index} className={classes.useCase}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {emoji.keywords.length > 0 ? (
            <section className={classes.section}>
              <h2 className={classes.sectionTitle}>Keywords</h2>
              <div className={classes.keywords}>
                {emoji.keywords.map((keyword, index) => (
                  <span key={index} className={classes.keyword}>{keyword}</span>
                ))}
              </div>
            </section>
          ) : null}

          {mainItem.variationBySkinTone.size > 0
            ? (
              <section className={classes.section}>
                <h2 className={classes.sectionTitle}>Skin Tone Variations</h2>
                <List
                  list={Array.from(mainItem.variationBySkinTone.values()).flat()}
                  options={options}
                  onCopy={onCopy}
                  onMouseEnterEmoji={onMouseEnterEmoji}
                  onMouseLeaveEmoji={onMouseLeaveEmoji}
                  onShowDetails={onShowDetails}
                />
              </section>
            )
            : null}

          <section className={classes.section}>
            <h2 className={classes.sectionTitle}>Technical Information</h2>
            <div className={classes.technicalInfo}>

              <div className={classes.infoGrid}>
                <span className={classes.infoLabel}>Unicode:</span>
                <span className={classes.infoValue}><code>{formatCopiedText(emoji, {
                  copyFormat: CopyFormat.UnicodeCodePoint,
                  skinTone: SkinTone.Default,
                })}</code></span>

                <span className={classes.infoLabel}>Decimal:</span>
                <span className={classes.infoValue}><code>{formatCopiedText(emoji, {
                  copyFormat: CopyFormat.UnicodeDecimal,
                  skinTone: SkinTone.Default,
                })}</code></span>

                <span className={classes.infoLabel}>HTML Hexadecimal:</span>
                <span className={classes.infoValue}><code>{formatCopiedText(emoji, {
                  copyFormat: CopyFormat.HTMLHexadecimal,
                  skinTone: SkinTone.Default,
                })}</code></span>

                <span className={classes.infoLabel}>HTML Decimal:</span>
                <span className={classes.infoValue}><code>{formatCopiedText(emoji, {
                  copyFormat: CopyFormat.HTMLDecimal,
                  skinTone: SkinTone.Default,
                })}</code></span>
              </div>

              {emoji.modifiers.length > 0
                ? (
                  <div className={classes.infoRow}>
                    <span className={classes.infoLabel}>Modifiers:</span>
                    <span className={classes.infoValue}>{emoji.modifiers.join(', ')}</span>
                  </div>
                )
                : null}
            </div>
          </section>

          <section className={classes.section}>
            <h2 className={classes.sectionTitle}>Related Emojis</h2>
            <List
              list={relatedEmojis}
              options={options}
              onCopy={onCopy}
              onMouseEnterEmoji={onMouseEnterEmoji}
              onMouseLeaveEmoji={onMouseLeaveEmoji}
              onShowDetails={onShowDetails}
            />
          </section>
        </main>
      </div>
    </div>
  )
}
