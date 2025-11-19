import clone from 'just-clone'

import { ERRORS } from '../../app/errors'
import { formatMessage } from '../../locales/locale'
import {
  RESIZE_TYPE_INCREMENT,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resolutionForResizeType,
  normalizeSegmentWidth,
  cancelSegmentResizeTransitions,
} from '../../segments/resizing'
import { getVariantInfo } from '../../segments/variant_utils'
import {
  setIgnoreStreetChanges,
  setLastStreet,
  saveStreetToServerIfNecessary,
} from '../../streets/data_model'
import { applyWarningsToSlices } from '../../streets/warnings'
import { recalculateWidth } from '../../streets/width'
import { saveStreetToServer } from '../../streets/xhr'
import apiClient from '../../util/api'
import { showError } from '../slices/errors'
import { updateSettings } from '../slices/settings'
import { addToast } from '../slices/toasts'
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
} from '../slices/street'
import { setInfoBubbleMouseInside } from '../slices/infoBubble'
import { setActiveSegment } from '../slices/ui'

import type { Dispatch, RootState } from '../index'
import type { StreetState } from '@streetmix/types'

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

export const segmentsChanged = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const street = getState().street
    const calculatedWidths = recalculateWidth(street)
    const updatedSlices = applyWarningsToSlices(street, calculatedWidths)

    await dispatch(
      updateSegments(
        updatedSlices,
        calculatedWidths.occupiedWidth.toNumber(),
        calculatedWidths.remainingWidth.toNumber()
      )
    )
    // ToDo: Refactor this out to be dispatched as well
    saveStreetToServerIfNecessary()
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

const createStreetFromResponse = (response: {
  data: { street: StreetState }
  creatorId?: string
  originalStreetId?: string
  updatedAt?: string
  name?: string
}): StreetState => {
  const street = clone(response.data.street)
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
