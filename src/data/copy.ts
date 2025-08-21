import type {EmojiItem} from './emojiData.ts'
import type {Options} from '../components/SearchBox/SearchBox.tsx'

export const CopyFormat = {
  Emoji: 'Emoji',
  UnicodeCodePoint: 'UnicodeCodePoint',
  UnicodeDecimal: 'UnicodeDecimal',
  HTMLHexadecimal: 'HTMLHexadecimal',
  HTMLDecimal: 'HTMLDecimal',
  JavaUTF16Escape: 'JavaUTF16Escape',
  JavaInt: 'JavaInt',
} as const

export type CopyFormatType = keyof typeof CopyFormat

export function formatCopiedText(emoji: EmojiItem, options: Options) {

  function toSurrogatePair(code: string) {
    // 1F60A -> \uD83D\uDE0A
    const codePoint = parseInt(code, 16)
    const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800
    const low = (codePoint - 0x10000) % 0x400 + 0xDC00
    return `\\u${high.toString(16)}\\u${low.toString(16)}`
  }

  switch (options.copyFormat) {
    case CopyFormat.Emoji:
      return emoji.emoji
    case CopyFormat.UnicodeCodePoint:
      return `${emoji.code.map(c => `U+${c}`).join(' ')}`
    case CopyFormat.UnicodeDecimal:
      return `${emoji.code.map(c => `${parseInt(c, 16).toString(10)}`).join(' ')}`
    case CopyFormat.HTMLHexadecimal:
      return `${emoji.code.map(c => `&#x${c};`).join(' ')}`
    case CopyFormat.HTMLDecimal:
      return `${emoji.code.map(c => `&#${parseInt(c, 16).toString(10)};`).join(' ')}`
    case CopyFormat.JavaInt:
      return `${emoji.code.map(c => `0x${c}`).join(' ')}`
    case CopyFormat.JavaUTF16Escape:
      return `${emoji.code.map(c => toSurrogatePair(c)).join(' ')}`
  }
}
