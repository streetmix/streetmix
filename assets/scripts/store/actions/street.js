import { cloneDeep } from 'lodash'
import {
  RESIZE_TYPE_INCREMENT,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resolutionForResizeType,
  normalizeSegmentWidth,
  cancelSegmentResizeTransitions
} from '../../segments/resizing'
import { getVariantArray } from '../../segments/variant_utils'
import { ERRORS } from '../../app/errors'
import { showError } from '../slices/errors'
import { hideLoadingScreen } from '../../app/load_resources'
import { recalculateWidth } from '../../streets/width'
import { saveStreetToServer } from '../../streets/xhr'
import {
  setIgnoreStreetChanges,
  setLastStreet,
  saveStreetToServerIfNecessary
} from '../../streets/data_model'
import { updateSettings } from '../slices/settings'
import apiClient from '../../util/api'

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
  saveOriginalStreetId
} from '../slices/street'

/**
 * updateStreetWidth as a thunk action that automatically
 * dispatches segmentChanged
 *
 * @param {Number} width
 */
export function updateStreetWidthAction (width) {
  return async (dispatch, getState) => {
    await dispatch(updateStreetWidth(width))
    await dispatch(segmentsChanged())
  }
}

export const segmentsChanged = () => {
  return async (dispatch, getState) => {
    const street = getState().street
    const updatedStreet = recalculateWidth(street)
    await dispatch(
      updateSegments(
        updatedStreet.segments,
        updatedStreet.occupiedWidth,
        updatedStreet.remainingWidth
      )
    )
    // ToDo: Refactor this out to be dispatched as well
    saveStreetToServerIfNecessary()
  }
}

export const removeSegmentAction = (dataNo) => {
  return async (dispatch, getState) => {
    await dispatch(removeSegment(dataNo, false))
    await dispatch(segmentsChanged())
  }
}

export const clearSegmentsAction = () => {
  return async (dispatch, getState) => {
    await dispatch(clearSegments())
    await dispatch(segmentsChanged())
  }
}

export const setShowAnalytics = (isVisible) => {
  return async (dispatch, getState) => {
    await dispatch(updateShowAnalytics(isVisible))
    await dispatch(segmentsChanged())
  }
}

export const setCapacitySource = (source) => {
  return async (dispatch, getState) => {
    await dispatch(updateCapacitySource(source))
    await dispatch(segmentsChanged())
  }
}
export const incrementSegmentWidth = (
  dataNo,
  add,
  precise,
  origWidth,
  resizeType = RESIZE_TYPE_INCREMENT
) => {
  return async (dispatch, getState) => {
    const units = getState().street.units
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

    cancelSegmentResizeTransitions()
    const width = normalizeSegmentWidth(origWidth + increment, resolution)
    await dispatch(changeSegmentWidth(dataNo, width))
    await dispatch(segmentsChanged())
  }
}

const createStreetFromResponse = (response) => {
  const street = cloneDeep(response.data.street)
  street.creatorId = (response.creator && response.creator.id) || null
  street.originalStreetId = response.originalStreetId || null
  street.updatedAt = response.updatedAt || null
  street.name = response.name || null
  street.location = response.data.street.location || null
  street.editCount = response.data.street.editCount || 0
  street.segments = street.segments.map((segment) => {
    segment.warnings = []
    segment.variant = getVariantArray(segment.type, segment.variantString)
    return segment
  })

  return street
}
export const getLastStreet = () => {
  return async (dispatch, getState) => {
    const lastStreetId = getState().app.priorLastStreetId
    const { id, namespacedId } = getState().street
    try {
      const response = await apiClient.getStreet(lastStreetId)
      const street = createStreetFromResponse(response)
      setIgnoreStreetChanges(true)
      await dispatch(
        updateSettings({
          lastStreetId: response.id,
          lastStreetNamespacedId: response.namespacedId,
          lastStreetCreatorId: street.creatorId
        })
      )
      dispatch(updateStreetData(street))
      if (id) {
        dispatch(saveStreetId(id, namespacedId))
      } else {
        dispatch(saveStreetId(response.id, response.namespacedId))
      }
      dispatch(saveOriginalStreetId(lastStreetId))
      await dispatch(segmentsChanged())
      setIgnoreStreetChanges(false)
      setLastStreet()
      saveStreetToServer(false)
    } catch (error) {
      dispatch(showError(ERRORS.NEW_STREET_SERVER_FAILURE, true))
      hideLoadingScreen()
    }
  }
}
