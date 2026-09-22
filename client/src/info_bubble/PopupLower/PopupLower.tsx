import { useSelector } from '~/src/store/hooks.js'
import { DescriptionPrompt } from './DescriptionPrompt.js'
import { Warnings } from './Warnings.js'

import type { BoundaryPosition, SliceItem } from '@streetmix/types'

interface PopupLowerProps {
  position: number | BoundaryPosition
  setArrowHighlighted: (v: boolean) => void
}

export function PopupLower({ position, setArrowHighlighted }: PopupLowerProps) {
  const street = useSelector((state) => state.street)

  // Slice is undefined when position refers to a building
  let slice: SliceItem | undefined
  if (typeof position === 'number') {
    slice = street.segments[position]
  }

  function handleDescriptionOver(): void {
    setArrowHighlighted(true)
  }

  function handleDescriptionOut(): void {
    setArrowHighlighted(false)
  }

  return (
    <>
      <Warnings slice={slice} />
      {slice?.type !== undefined && (
        <DescriptionPrompt
          type={slice.type}
          variantString={slice.variantString}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
        />
      )}
    </>
  )
}
