import { getSegmentInfo } from '@streetmix/parts'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import {
  setBuildingVariant,
  changeSegmentVariant,
} from '~/src/store/slices/street.js'
import VARIANT_ICONS from '~/src/segments/variant_icons.yaml'
import { getVariantInfo } from '~/src/segments/variant_utils.js'
import { VariantButton } from './VariantButton.js'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function VariantSet(props: SectionElementTypeAndPosition) {
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
  const universalElevation = useSelector(
    (state) => state.flags.UNIVERSAL_ELEVATION_CONTROLS?.value ?? false
  )
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )
  const dispatch = useDispatch()

  let variantSets: string[] = []
  if (type === 'boundary') {
    variantSets = Object.keys(VARIANT_ICONS.boundary)
  } else {
    const { variants } = getSegmentInfo(segment.type)
    variantSets = variants
  }

  // Remove any empty entries
  variantSets = variantSets.filter((x) => x !== '')

  // If we are doing universal elevation or Coastmix, filter out elevation
  // Note -- if these buttons are present, and a slice elevation has been
  // marked as user-changed, then these buttons won't do anything
  if (universalElevation || coastmixMode) {
    variantSets = variantSets.filter((x) => x !== 'elevation')
  }

  function isVariantCurrentlySelected(set: string, selection: string): boolean {
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

  function getButtonOnClickHandler(set: string, selection: string): () => void {
    let handler

    if (type === 'boundary') {
      handler = () => {
        dispatch(setBuildingVariant(position, selection))
      }
    } else {
      handler = () => {
        dispatch(changeSegmentVariant(position, set, selection))
        dispatch(segmentsChanged())
      }
    }

    return handler
  }

  function renderButtonGroup(set: string, items: string[]): React.ReactElement {
    return (
      <div className="popup-control-row popup-control-button-group" key={set}>
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

  function renderVariantsSelection():
    | Array<React.ReactElement>
    | React.ReactElement
    | null {
    if (type === 'boundary') {
      return renderButtonGroup('boundary', variantSets)
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
