import {useMemo} from 'preact/hooks'

type ModifierInfo = {
  modifierKeyLabel: string,
  isModifierPressed: (event: MouseEvent | KeyboardEvent) => boolean
}

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.platform ?? ''
  const userAgent = navigator.userAgent ?? ''
  return /mac/i.test(platform) || /mac os x/i.test(userAgent)
}

export function useModifierKey(): ModifierInfo {
  const isMac = isMacPlatform()

  const isModifierPressed = useMemo(() => {
    return (event: MouseEvent | KeyboardEvent) => {
      return isMac ? !!(event as any).metaKey : !!(event as any).ctrlKey
    }
  }, [isMac])

  return {
    modifierKeyLabel: isMac ? '⌘' : 'Ctrl',
    isModifierPressed
  }
}



