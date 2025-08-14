import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  setBuildingVariant,
  changeSegmentVariant
} from '~/src/store/slices/street'
import { segmentsChanged } from '~/src/segments/view'
import { getSegmentInfo } from '~/src/segments/info'
import VARIANT_ICONS from '~/src/segments/variant_icons.yaml'
import { getVariantInfo } from '~/src/segments/variant_utils'
import { VariantButton } from './VariantButton'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

function Variants (
  props: SectionElementTypeAndPosition
): React.ReactElement | null {
  const { type, position } = props

  // Get the appropriate variant information
  const variant = useSelector((state) => {
    if (type === 'boundary') {
      return state.street.boundary[position].variant
    } else {
      return state.street.segments[position].variantString
    }
  })
  const segment = useSelector((state) => {
    if (type === 'slice') {
      return state.street.segments[position]
    }

    return null
  })
  const dispatch = useDispatch()

  let variantSets: string[] = []
  if (type === 'boundary') {
    variantSets = Object.keys(VARIANT_ICONS.building)
  } else {
    const { variants } = getSegmentInfo(segment.type)
    variantSets = variants
  }

  // Remove any empty entries
  variantSets = variantSets.filter((x) => x !== '')

  function isVariantCurrentlySelected (set: string, selection: string): boolean {
    let bool = false

    if (type === 'boundary') {
      bool = selection === variant
    } else {
      if (segment) {
        const obj = getVariantInfo(segment.type, variant)
        bool = selection === obj[set as keyof typeof obj]
      }
    }

    return bool
  }

  function getButtonOnClickHandler (set: string, selection: string): () => void {
    let handler

    if (type === 'boundary') {
      handler = () => {
        dispatch(setBuildingVariant(position, selection))
      }
    } else {
      handler = () => {
        dispatch(changeSegmentVariant(position, set, selection))
        segmentsChanged()
      }
    }

    return handler
  }

  function renderButtonGroup (set: string, items: string[]): React.ReactElement {
    return (
      <div className="popup-control-button-group" key={set}>
        {items.map((selection) => (
          <VariantButton
            set={set}
            selection={selection}
            isSelected={isVariantCurrentlySelected(set, selection)}
            onClick={getButtonOnClickHandler(set, selection)}
            key={set + '.' + selection}
          />
        ))}
      </div>
    )
  }

  function renderVariantsSelection ():
    | Array<React.ReactElement>
    | React.ReactElement
    | null {
    if (type === 'boundary') {
      return renderButtonGroup('building', variantSets)
    } else {
      return variantSets.map((set) =>
        renderButtonGroup(set, Object.keys(VARIANT_ICONS[set]))
      )
    }
  }

  // Do not render this component if there are no variants to select
  if (variantSets.length === 0) return null

  return <div className="variants">{renderVariantsSelection()}</div>
}

export default Variants
