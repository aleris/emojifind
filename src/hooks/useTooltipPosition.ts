import { useLayoutEffect, useState } from 'preact/hooks'
import type {RefObject} from 'preact'

interface Position {
  x: number
  y: number
}

interface UseTooltipPositionParams {
  targetElement: HTMLElement
  tooltipRef: RefObject<HTMLElement>
  dependencies?: any[]
  offset?: number
  margin?: number
}

export function useTooltipPosition({
  targetElement,
  tooltipRef,
  dependencies = [],
  offset = 8,
  margin = 8
}: UseTooltipPositionParams): Position {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })

  useLayoutEffect(() => {
    if (!tooltipRef.current) return

    // Calculate absolute position of the target element
    const rect = targetElement.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    // Get actual tooltip dimensions
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width
    const tooltipHeight = tooltipRect.height

    // Calculate initial position (bottom center of element)
    let x = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2)
    let y = rect.bottom + scrollY + offset

    // Get window dimensions
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // Bound horizontally within window
    if (x < 0) {
      x = margin
    } else if (x + tooltipWidth > windowWidth) {
      x = windowWidth - tooltipWidth - margin
    }

    // Bound vertically within window
    if (y + tooltipHeight > windowHeight + scrollY) {
      // If tooltip would go below viewport, position it above the element instead
      y = rect.top + scrollY - tooltipHeight - offset

      // If it still doesn't fit above, position it at the top of the viewport
      if (y < scrollY) {
        y = scrollY + margin
      }
    }

    setPosition({ x, y })
  }, [targetElement, tooltipRef, offset, margin, ...dependencies])

  return position
}
