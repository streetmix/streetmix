import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { loseAnyFocus } from '~/src/util/focus.js'
import { TooltipGroup } from '~/src/ui/Tooltip.js'
import { setInfoBubbleMouseInside } from '../store/slices/infoBubble.js'
import { PopupControls } from './PopupControls'
import { PopupHeader } from './PopupHeader'
import { PopupLower } from './PopupLower'
import type { SegmentNoteDraft } from './PopupLower/PopupLower.js'

import type { SectionElementTypeAndPosition, Prettify } from '@streetmix/types'

type PopupContentProps = Prettify<
  SectionElementTypeAndPosition & {
    setArrowHighlighted: (v: boolean) => void
    noteDraft: SegmentNoteDraft | null
    setNoteDraft: (draft: SegmentNoteDraft | null) => void
  }
>

// `...props` is a discriminated union of `SectionElementTypeAndPosition`,
// do not destructure it or it will lose type safety!
export function PopupContent({
  setArrowHighlighted,
  noteDraft,
  setNoteDraft,
  ...props
}: PopupContentProps) {
  const dispatch = useDispatch()
  const readOnly = useSelector((state) => state.app.readOnly)

  const classNames = ['popup-content']

  if (props.type === 'boundary') {
    classNames.push('popup-at-boundary')
  }

  function handleMouseEnter() {
    dispatch(setInfoBubbleMouseInside(true))
  }

  function handleMouseLeave(event: React.MouseEvent<HTMLDivElement>) {
    dispatch(setInfoBubbleMouseInside(false))

    // Returns focus to body when pointer leaves the info bubble area
    // so that keyboard commands respond to pointer position rather than
    // any focused buttons/inputs
    // TODO: do we still need this? (ported from legacy infobubble)
    if (
      noteDraft === null &&
      event.currentTarget.contains(document.activeElement)
    ) {
      loseAnyFocus()
    }
  }

  return (
    <div
      className={classNames.join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TooltipGroup>
        {!readOnly && (
          <>
            <PopupHeader {...props} />
            <PopupControls {...props} />
          </>
        )}
        <PopupLower
          setArrowHighlighted={setArrowHighlighted}
          noteDraft={noteDraft}
          setNoteDraft={setNoteDraft}
          {...props}
        />
      </TooltipGroup>
    </div>
  )
}
