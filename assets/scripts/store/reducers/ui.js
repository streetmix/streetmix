import {
  SHOW_STREET_NAME_CANVAS,
  HIDE_STREET_NAME_CANVAS,
  SET_UNIT_SETTINGS,
  SET_ACTIVE_SEGMENT,
  INIT_DRAGGING_STATE,
  UPDATE_DRAGGING_STATE,
  CLEAR_DRAGGING_STATE,
  SET_DRAGGING_TYPE,
  TOGGLE_TOOLBOX
} from '../actions'
import * as UserConstants from '../../users/constants'
import * as SegmentConstants from '../../segments/constants'

const initialState = {
  streetNameCanvasVisible: true,
  toolboxVisible: false,
  unitSettings: {
    resolution: UserConstants.SEGMENT_WIDTH_RESOLUTION_METRIC,
    draggingResolution: UserConstants.SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC,
    clickIncrement: UserConstants.SEGMENT_WIDTH_CLICK_INCREMENT_METRIC
  },
  activeSegment: null,
  draggingState: null,
  draggingType: 0,
  resizeGuidesVisible: false
}

const ui = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_STREET_NAME_CANVAS:
      return {
        ...state,
        streetNameCanvasVisible: true
      }
    case HIDE_STREET_NAME_CANVAS:
      return {
        ...state,
        streetNameCanvasVisible: false
      }
    case SET_UNIT_SETTINGS:
      const imperial = (action.unit === UserConstants.SETTINGS_UNITS_IMPERIAL)
      return {
        ...state,
        unitSettings: {
          resolution: (imperial) ? UserConstants.SEGMENT_WIDTH_RESOLUTION_IMPERIAL : UserConstants.SEGMENT_WIDTH_RESOLUTION_METRIC,
          draggingResolution: (imperial) ? UserConstants.SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL : UserConstants.SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC,
          clickIncrement: (imperial) ? UserConstants.SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL : UserConstants.SEGMENT_WIDTH_CLICK_INCREMENT_METRIC
        }
      }
    case SET_ACTIVE_SEGMENT:
      // If we're in the middle of a resize drag state, do not allow setting a new active segment.
      if (state.resizeGuidesVisible === true) {
        return { ...state }
      } else {
        return {
          ...state,
          activeSegment: action.position
        }
      }
    case INIT_DRAGGING_STATE:
      return {
        ...state,
        draggingState: {
          segmentBeforeEl: action.segmentBeforeEl,
          segmentAfterEl: action.segmentAfterEl,
          draggedSegment: action.draggedSegment
        },
        draggingType: action.draggingType
      }
    case UPDATE_DRAGGING_STATE:
      return {
        ...state,
        draggingState: {
          segmentBeforeEl: action.segmentBeforeEl,
          segmentAfterEl: action.segmentAfterEl,
          draggedSegment: action.draggedSegment
        }
      }
    case CLEAR_DRAGGING_STATE:
      return {
        ...state,
        draggingState: null,
        draggingType: SegmentConstants.DRAGGING_TYPE_NONE
      }
    case SET_DRAGGING_TYPE:
      return {
        ...state,
        draggingType: action.draggingType,
        resizeGuidesVisible: (action.draggingType === SegmentConstants.DRAGGING_TYPE_RESIZE)
      }
    case TOGGLE_TOOLBOX:
      return {
        ...state,
        toolboxVisible: !state.toolboxVisible
      }
    default:
      return state
  }
}

export default ui
