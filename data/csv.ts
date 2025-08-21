export interface EmojiItem {
  id: string;
  group: string;
  subgroup: string;
  code: string[];
  status: string;
  emoji: string;
  version: string;
  name: string;
  modifiers: string[];
  hasSkinToneModifier: boolean;
  title: string;
  keywords: string[];
}

async function parseEmoji(): Promise<EmojiItem[]> {
  // Parse XML annotations file
  const annotationMap = new Map<string, string[]>()
  const annotationsFileText = await Bun.file('./input/en.xml').text()

  const annotationRegex = /<annotation cp="([^"]+)">([^<]+)<\/annotation>/g
  let match
  while ((match = annotationRegex.exec(annotationsFileText)) !== null) {
    const cp = match[1]!
    const value = match[2]!.trim()
    annotationMap.set(cp, value.split(' | '))
  }

  const emojiTestFileText = await Bun.file('./input/emoji-test.txt').text()

  const lines = emojiTestFileText.split('\n')

  let currentGroup = ''
  let currentSubgroup = ''
  const items: EmojiItem[] = []

  for (const [index, line] of lines.entries()) {
    // Skip empty lines and header comments
    if (line === '' || (isComment(line) && !isGroup(line) && !isSubgroup(line))) {
      continue
    }

    if (isGroup(line)) {
      currentGroup = line.split('# group:')[1]!.trim()
      continue
    }

    if (isSubgroup(line)) {
      currentSubgroup = toTileCase(line.split('# subgroup:')[1]!.trim().replace(/-/g, ' '))
      continue
    }

    const [codeParts, rest1] = line.split(';').map(s => s.trim())
    const [status, rest2] = rest1!.split('#').map(s => s.trim())
    const [rest3, modifier] = rest2!.split(':').map(s => s.trim())
    const descMatch = rest3!.match(/(.+)\s(E.+?)\s(.+)/u)
    if (descMatch !== null) {
      const code = codeParts!.split(' ').map(c => c.trim())
      const emoji = descMatch[1]!.trim() ?? ''
      const version = descMatch[2]!.trim() ?? ''
      const name = descMatch[3]!.trim() ?? ''
      const modifiers = modifier?.split(',').map(m => m.trim()) ?? []
      const hasSkinToneModifier = modifiers.some(m => m.endsWith(' skin tone'))
      const title = makeTitle(name, modifiers)
      items.push({
        id: `${index}`,
        group: currentGroup,
        subgroup: currentSubgroup,
        code,
        status: status!,
        emoji,
        version,
        name,
        modifiers,
        hasSkinToneModifier,
        title: title,
        keywords: annotationMap.get(emoji) ?? [],
      })
    }
  }

  return items
}

function isComment(line: string) {
  return line.startsWith('#')
}

function isGroup(line: string) {
  return line.includes('# group:')
}

function isSubgroup(line: string) {
  return line.includes('# subgroup:')
}

function toTileCase(text: string) {
  const functionalWords = new Set('a, an, the, of, in, on, at, by, for, up, to, with, from, over, into, upon, and, but, or, nor, for, so, yet, as'.split(', '))
  const isFunctional = (segment: string) => {
    return functionalWords.has(segment)
  }
  return text.split(' ').filter(segment => !isFunctional(segment)).map(segment => {
    return segment.slice(0, 1).toUpperCase() + segment.slice(1)
  }).join(' ').split('-').map(segment => {
    return segment.slice(0, 1).toUpperCase() + segment.slice(1)
  }).join('-')
}

function makeTitle(name:string, modifiers:string[]) {
  if (modifiers.length === 0) {
    return toTileCase(name)
  }
  return `${toTileCase(name)}: ${modifiers.map(m => toTileCase(m)).join(', ')}`
}

async function writeCSV(items: EmojiItem[]) {
  const groups = new Set(items.map((item) => `${item.group}␜${item.subgroup}`))
  const groupsMap = new Map<string, number>(groups.values().map((group, index) => [group, index]))
  const groupsFile = Bun.file('../src/assets/groups.csv')
  await groupsFile.delete()
  const groupsWriter = groupsFile.writer()
  groupsWriter.write('group␜subgroup\n')
  for (const [group, id] of groupsMap.entries()) {
    groupsWriter.write(`${id}␜${group}\n`)
  }
  const outputFile = Bun.file('../src/assets/emoji.csv')
  await outputFile.delete()
  const writer = outputFile.writer()
  writer.write('emoji␜group␜code␜title␜modifiers␜tone␜keywords\n')
  for (const item of items) {
    const groupId = groupsMap.get(`${item.group}␜${item.subgroup}`)!
    writer.write(`${item.emoji}␜${groupId}␜${item.code.join(';')}␜${item.title}␜${item.modifiers.join(';')}␜${item.hasSkinToneModifier}␜${item.keywords.join(';')}\n`)
  }
}

const items = await parseEmoji()
await writeCSV(items.filter(item => item.status === 'fully-qualified' && item.emoji !== '🫪' && item.emoji !== '🫈'))
