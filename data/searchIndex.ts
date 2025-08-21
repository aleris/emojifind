import MiniSearch from 'minisearch'
import {readItems, type EmojiItem, searchOptions} from '../src/data/emojiData.ts'

function resolvePath(relativePath: string): string {
  return new URL(relativePath, import.meta.url).pathname
}

async function buildIndex() {
  const items = readItems()

  // Pre-load all descriptions
  const itemsWithDescriptions = await Promise.all(
    items.map(async (item) => {
      if (item.hasSkinToneModifier) {
        return item
      }

      const file = Bun.file(resolvePath(`../src/assets/desc/${item.emoji}.txt`))
      let description = ''

      try {
        if (await file.exists()) {
          description = await file.text()
        }
      } catch (error) {}

      return {
        ...item,
        description: description.trim()
      }
    })
  )

  const mini = new MiniSearch<EmojiItem>(
    {
      ...searchOptions,
      extractField: (item, fieldName) => {
        return (item as any)[fieldName]
      }
    }
  )

  mini.addAll(itemsWithDescriptions.filter(item => !item.hasSkinToneModifier))

  const json = JSON.stringify(mini)
  const out = Bun.file(resolvePath('../src/assets/index.json'))
  if (await out.exists()) {
    await out.delete()
  }
  const writer = out.writer()
  writer.write(json)
  writer.end()

  console.log('Wrote ../src/assets/index.json')
}

buildIndex().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
