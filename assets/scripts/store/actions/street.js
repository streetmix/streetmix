import {
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  REPLACE_SEGMENTS,
  CHANGE_SEGMENT_WIDTH
} from './'

export function addSegment (index, segment) {
  return {
    type: ADD_SEGMENT,
    index,
    segment
  }
}

export function removeSegment (index) {
  return {
    type: REMOVE_SEGMENT,
    index
  }
}

export function moveSegment (index, newIndex) {
  return {
    type: MOVE_SEGMENT,
    index,
    newIndex
  }
}

// temporary while we migrate data stores
export function replaceSegments (segments) {
  return {
    type: REPLACE_SEGMENTS,
    segments
  }
}

export function changeSegmentWidth (index, width) {
  return {
    type: CHANGE_SEGMENT_WIDTH,
    index,
    width
  }
}
