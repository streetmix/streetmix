import clone from 'just-clone'

import { checkSeaLevel } from '~/src/plugins/coastmix/sea_level.js'
import { ERRORS } from '~/src/app/errors.js'
import { formatMessage } from '~/src/locales/locale.js'
import {
  RESIZE_TYPE_INCREMENT,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resolutionForResizeType,
  normalizeSegmentWidth,
  cancelSegmentResizeTransitions,
} from '~/src/segments/resizing.js'
import { getSlopeValues } from '~/src/segments/slope.js'
import { getVariantInfo } from '~/src/segments/variant_utils.js'
import {
  setIgnoreStreetChanges,
  setLastStreet,
  saveStreetToServerIfNecessary,
} from '~/src/streets/data_model.js'
import { applyWarningsToSlices } from '~/src/streets/warnings.js'
import { recalculateWidth } from '~/src/streets/width.js'
import { saveStreetToServer } from '~/src/streets/xhr.js'
import apiClient from '~/src/util/api.js'
import { showError } from '../slices/errors.js'
import { updateSettings } from '../slices/settings.js'
import { addToast } from '../slices/toasts.js'
import {
  updateStreetWidth,
  updateSegments,
  removeSegment,
  clearSegments,
  changeSegmentWidth,
  updateStreetData,
  updateShowAnalytics,
  updateCapacitySource,
  saveStreetId,
  saveOriginalStreetId,
} from '../slices/street.js'
import { setInfoBubbleMouseInside } from '../slices/infoBubble.js'
import { setActiveSegment } from '../slices/ui.js'
import { setFloodDistance } from '../slices/coastmix.js'

import type { Dispatch, RootState } from '../index.js'
import type {
  SliceItem,
  StreetAPIResponse,
  StreetState,
} from '@streetmix/types'

/**
 * updateStreetWidth as a thunk action that automatically
 * dispatches segmentChanged
 *
 * @param width
 */
export function updateStreetWidthAction(width: number) {
  return async (dispatch: Dispatch) => {
    await dispatch(updateStreetWidth(width))
    await dispatch(segmentsChanged())
  }
}

export const segmentsChanged = (force = false) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const { street, coastmix } = getState()

    const calculatedWidths = recalculateWidth(street)

    // Original slices state is read-only, so we need to clone it to modify
    // and update its properties.
    const clonedSlices: SliceItem[] = street.segments.map((slice, index) => {
      // Calculate slope values, if needed
      let slopeValues: number[] = []
      if (slice.slope?.on) {
        slopeValues = getSlopeValues(street, index)
      }

      return {
        // This shallow-copies the original data, which is generally fine
        // for everything but two properties
        ...slice,
        // This will be appended to by `applyWarningsToSlices`
        warnings: [false],
        // This will be modified by slope calculation
        slope: {
          on: slice.slope?.on ?? false,
          values: slopeValues,
        },
      }
    })

    const updatedSlices = applyWarningsToSlices(
      clonedSlices,
      street,
      calculatedWidths
    )
    const floodDistance = checkSeaLevel(updatedSlices, coastmix) ?? null

    await dispatch(
      updateSegments(
        updatedSlices,
        calculatedWidths.occupiedWidth.toNumber(),
        calculatedWidths.remainingWidth.toNumber()
      )
    )
    await dispatch(setFloodDistance(floodDistance))

    // ToDo: Refactor this out to be dispatched as well
    // Forcing a save is necessary when the data to be saved is not in the
    // street data blob (e.g. plugins data)
    saveStreetToServerIfNecessary(force)
  }
}

export const removeSegmentAction = (segmentIndex: number) => {
  return async (dispatch: Dispatch) => {
    await dispatch(removeSegment(segmentIndex, false))
    await dispatch(segmentsChanged())

    // Reset various UI states
    await dispatch(setActiveSegment(null))
    await dispatch(setInfoBubbleMouseInside(false))

    await dispatch(
      addToast({
        message: formatMessage(
          'toast.segment-deleted',
          'The segment has been removed.'
        ),
        component: 'TOAST_UNDO',
      })
    )
  }
}

export const clearSegmentsAction = () => {
  return async (dispatch: Dispatch) => {
    await dispatch(clearSegments())
    await dispatch(segmentsChanged())

    // Reset various UI states
    await dispatch(setActiveSegment(null))
    await dispatch(setInfoBubbleMouseInside(false))

    await dispatch(
      addToast({
        message: formatMessage(
          'toast.all-segments-deleted',
          'All segments have been removed.'
        ),
        component: 'TOAST_UNDO',
      })
    )
  }
}

export const setShowAnalytics = (isVisible: boolean) => {
  return async (dispatch: Dispatch) => {
    await dispatch(updateShowAnalytics(isVisible))
    await dispatch(segmentsChanged())
  }
}

export const setCapacitySource = (source: string) => {
  return async (dispatch: Dispatch) => {
    await dispatch(updateCapacitySource(source))
    await dispatch(segmentsChanged())
  }
}

export const incrementSegmentWidth = (
  sliceIndex: number,
  add: boolean,
  precise: boolean,
  resizeType: number = RESIZE_TYPE_INCREMENT
) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const units = getState().street.units
    const origWidth = getState().street.segments[sliceIndex].width

    let resolution

    if (precise) {
      resolution = resolutionForResizeType(RESIZE_TYPE_PRECISE_DRAGGING, units)
    } else {
      resolution = resolutionForResizeType(resizeType, units)
    }

    let increment = resolution

    if (!add) {
      increment = -increment
    }

    // When width values are imprecise (e.g. after unit conversion), the
    // increment to nearest precise value, rather than increment first and
    // then make precise
    const adjustedWidth = normalizeSegmentWidth(origWidth, resolution)

    let width
    if (origWidth !== adjustedWidth) {
      if (add && adjustedWidth > origWidth) {
        width = adjustedWidth
      } else if (!add && adjustedWidth < origWidth) {
        width = adjustedWidth
      } else {
        width = normalizeSegmentWidth(origWidth + increment, resolution)
      }
    } else {
      width = normalizeSegmentWidth(origWidth + increment, resolution)
    }

    cancelSegmentResizeTransitions()
    await dispatch(changeSegmentWidth(sliceIndex, width))
    await dispatch(segmentsChanged())
  }
}

const createStreetFromResponse = (response: StreetAPIResponse): StreetState => {
  // This is where the response format gets flattened for Redux state
  // Not sure if we have to do all this, tbh...
  const street = clone(response.data.street) as StreetState
  street.creatorId = response.creatorId || null
  street.originalStreetId = response.originalStreetId || null
  street.updatedAt = response.updatedAt || undefined
  street.name = response.name || null
  street.location = response.data.street.location || null
  street.editCount = response.data.street.editCount || 0
  street.segments = street.segments.map((segment) => {
    segment.warnings = [false]
    segment.variant = getVariantInfo(segment.type, segment.variantString)
    return segment
  })

  return street
}

// Currently not being used but could replace fetchLastStreet in xhr.js
export const getLastStreet = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const lastStreetId = getState().app.priorLastStreetId
    const { id, namespacedId } = getState().street

    if (!lastStreetId) return

    try {
      const response = await apiClient.getStreet(lastStreetId)
      const data = response.data
      const street = createStreetFromResponse(data)
      setIgnoreStreetChanges(true)
      await dispatch(
        updateSettings({
          lastStreetId: data.id,
          lastStreetNamespacedId: data.namespacedId,
          lastStreetCreatorId: street.creatorId,
        })
      )
      dispatch(updateStreetData(street))
      if (id) {
        dispatch(saveStreetId(id, namespacedId))
      } else {
        dispatch(saveStreetId(data.id, data.namespacedId))
      }
      dispatch(saveOriginalStreetId(lastStreetId))
      await dispatch(segmentsChanged())
      setIgnoreStreetChanges(false)
      setLastStreet()
      saveStreetToServer(false)
    } catch (error) {
      dispatch(showError(ERRORS.NEW_STREET_SERVER_FAILURE, true))
    }
  }
}
