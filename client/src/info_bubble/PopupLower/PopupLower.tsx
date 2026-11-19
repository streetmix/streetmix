import { useEffect, useId, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import { Button } from '~/src/ui/Button.js'
import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { changeSegmentProperties } from '~/src/store/slices/street.js'
import { DescriptionPrompt } from './DescriptionPrompt.js'
import { Warnings } from './Warnings.js'
import './PopupLower.css'

import type { BoundaryPosition, SliceItem } from '@streetmix/types'

export interface SegmentNoteDraft {
  streetId: string
  segmentId: string
  text: string
}

interface PopupLowerProps {
  position: number | BoundaryPosition
  setArrowHighlighted: (v: boolean) => void
  noteDraft: SegmentNoteDraft | null
  setNoteDraft: (draft: SegmentNoteDraft | null) => void
}

export function PopupLower({
  position,
  setArrowHighlighted,
  noteDraft,
  setNoteDraft,
}: PopupLowerProps) {
  const street = useSelector((state) => state.street)
  const readOnly = useSelector((state) => state.app.readOnly)
  const dispatch = useDispatch()
  const inputId = useId()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isEditing = noteDraft !== null

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

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
      {!readOnly && <Warnings slice={slice} />}
      {!readOnly && slice?.type !== undefined && (
        <DescriptionPrompt
          type={slice.type}
          variantString={slice.variantString}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
        />
      )}
      {slice && (!readOnly || slice.note) && (
        <div className="popup-segment-note">
          {isEditing && !readOnly ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const index = street.segments.findIndex(
                  (segment) => segment.id === noteDraft.segmentId
                )
                const note = noteDraft.text.trim() || undefined
                if (
                  street.id === noteDraft.streetId &&
                  index >= 0 &&
                  street.segments[index].note !== note
                ) {
                  dispatch(changeSegmentProperties(index, { note }))
                  dispatch(segmentsChanged())
                }
                setNoteDraft(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  event.stopPropagation()
                  setNoteDraft(null)
                }
              }}
            >
              <label htmlFor={inputId}>
                <FormattedMessage
                  id="segments.note.label"
                  defaultMessage="Segment note"
                />
              </label>
              <textarea
                id={inputId}
                ref={inputRef}
                rows={4}
                value={noteDraft.text}
                onChange={(event) =>
                  setNoteDraft({ ...noteDraft, text: event.target.value })
                }
              />
              <div className="popup-segment-note-actions">
                <Button primary type="submit">
                  <FormattedMessage id="btn.save" defaultMessage="Save" />
                </Button>
                <Button tertiary onClick={() => setNoteDraft(null)}>
                  <FormattedMessage id="btn.cancel" defaultMessage="Cancel" />
                </Button>
              </div>
            </form>
          ) : (
            <>
              {slice.note && <p>{slice.note}</p>}
              {!readOnly && (
                <div className="popup-segment-note-actions">
                  <Button
                    tertiary
                    onClick={() => {
                      setNoteDraft({
                        streetId: street.id,
                        segmentId: slice.id,
                        text: slice.note ?? '',
                      })
                    }}
                  >
                    {slice.note ? (
                      <FormattedMessage
                        id="segments.note.edit"
                        defaultMessage="Edit note"
                      />
                    ) : (
                      <FormattedMessage
                        id="segments.note.add"
                        defaultMessage="Add note"
                      />
                    )}
                  </Button>
                  {slice.note && (
                    <Button
                      tertiary
                      onClick={() => {
                        if (typeof position === 'number') {
                          dispatch(
                            changeSegmentProperties(position, {
                              note: undefined,
                            })
                          )
                          dispatch(segmentsChanged())
                        }
                      }}
                    >
                      <FormattedMessage
                        id="segments.note.delete"
                        defaultMessage="Delete note"
                      />
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
