import emojiFileContent from '../assets/emoji.csv?raw'
import groupsFileContent from '../assets/groups.csv?raw'
import MiniSearch from 'minisearch'
import indexJson from '../assets/index.json?raw'

export const SkinTone = {
  Default: 'Default',
  Light: 'Light',
  MediumLight: 'MediumLight',
  Medium: 'Medium',
  MediumDark: 'MediumDark',
  Dark: 'Dark',
} as const

export type SkinToneType = keyof typeof SkinTone

export interface EmojiItem {
  emoji: string;
  id: string;
  group: string;
  subgroup: string;
  code: string[];
  title: string;
  modifiers: string[];
  variationOf: EmojiItem | null;
  variationBySkinTone: Map<SkinToneType, EmojiItem[]>;
  hasSkinToneModifier: boolean;
  keywords: string[];
  description?: string;
}

export interface EmojiData {
  items: EmojiItem[];
  emojiById: Map<string, EmojiItem>;
  groups: Group[];
  groupByCode: Map<string, Group>;
  searchIndex: MiniSearch<EmojiItem>;
}

export interface Group {
  name: string;
  subgroups: Subgroup[];
  subgroupsByCode: Map<string, Subgroup>;
}

export interface Subgroup {
  name: string;
  emojis: EmojiItem[];
}

export interface FileGroup {
  id: string;
  group: string;
  subgroup: string;
}

export function readItems(): EmojiItem[] {
  const fileGroups: FileGroup[] = groupsFileContent.trim().split('\n')
    .slice(1)
    .map(line => line.split('␜').map(s => s.trim()))
    .filter(line => line.length === 3).map(([id, group, subgroup]) => ({id, group, subgroup}))
  const fileGroupById = new Map(fileGroups.map(group => [group.id, group]))
  const items: EmojiItem[] = emojiFileContent.trim().split('\n')
    .slice(1)
    .map(line => line.split('␜').map(s => s.trim()))
    .map(([emoji, groupId, codeString, title, modifiersString, tone, keywordsString]) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const group = fileGroupById.get(groupId)!
      const keywords = keywordsString.length === 0 ? [] : keywordsString.split(';')
      const modifiers = modifiersString.length === 0 ? [] : modifiersString.split(';')
      const code = codeString.length === 0 ? [] : codeString.split(';')
      return {
        emoji,
        id,
        group: group.group,
        subgroup: group.subgroup,
        code,
        title,
        variationOf: null,
        modifiers,
        variationBySkinTone: new Map(),
        hasSkinToneModifier: tone === 'true',
        keywords: keywords,
      }
    })
  return items
}

export const searchOptions = {
  idField: 'emoji',
  fields: ['title', 'keywords', 'emoji', 'code', 'subgroup', 'group', 'description'],
  storeFields: ['id'],
  searchOptions: {
    boost: {
      title: 13,
      keywords: 8,
      emoji: 5,
      code: 3,
      subgroup: 2,
      group: 1,
    },
    prefix: true,
  }
}

export function load(): EmojiData {
  const items = readItems()
  const emojiById = new Map(items.map(item => [item.id, item]))

  const groupByCode = new Map<string, Group>()
  for (const item of items) {
    if (!groupByCode.has(item.group)) {
      const group: Group = {
        name: item.group,
        subgroups: [],
        subgroupsByCode: new Map(),
      }
      groupByCode.set(item.group, group)
    }
    const group = groupByCode.get(item.group)!
    if (!group.subgroupsByCode.has(item.subgroup)) {
      const subgroup: Subgroup = {
        name: item.subgroup,
        emojis: [],
      }
      group.subgroups.push(subgroup)
      group.subgroupsByCode.set(item.subgroup, subgroup)
    }

    group.subgroupsByCode.get(item.subgroup)!.emojis.push(item)
  }

  // build variations
  const mainItemByFirstCode: Map<string, EmojiItem> = new Map()
  for (const item of items) {
    if (!item.hasSkinToneModifier) {
      mainItemByFirstCode.set(item.code[0], item)
    } else {
      const mainItem = mainItemByFirstCode.get(item.code[0])
      if (mainItem !== undefined) {
        if (item.modifiers.length > 0) {
          for (const modifier of item.modifiers) {
            const skinTone = mapSkinTone(modifier)
            if (skinTone !== undefined) {
              const existing = mainItem.variationBySkinTone.get(skinTone) ?? []
              mainItem.variationBySkinTone.set(skinTone, existing.concat(item))
              item.variationOf = mainItem
            }
          }
        } else {
          mainItem.variationBySkinTone.set(SkinTone.Default, [item])
        }
      }
    }
  }


  const searchIndex = MiniSearch.loadJSON<EmojiItem>(indexJson, searchOptions)

  const groups = Array.from(groupByCode.values())
  return {
    items,
    emojiById,
    groups,
    groupByCode,
    searchIndex,
  }
}

function mapSkinTone(modifier: string): SkinToneType | undefined {
  if (modifier === 'light skin tone') {
    return SkinTone.Light
  } else if (modifier === 'medium-light skin tone') {
    return SkinTone.MediumLight
  } else if (modifier === 'medium skin tone') {
    return SkinTone.Medium
  } else if (modifier === 'medium-dark skin tone') {
    return SkinTone.MediumDark
  } else if (modifier === 'dark skin tone') {
    return SkinTone.Dark
  } else {
    return undefined
  }
}
