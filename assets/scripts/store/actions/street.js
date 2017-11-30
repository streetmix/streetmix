import {
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  REPLACE_STREET_DATA,
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
export function updateStreetData (street) {
  return {
    type: REPLACE_STREET_DATA,
    street
  }
}

export function changeSegmentWidth (index, width) {
  return {
    type: CHANGE_SEGMENT_WIDTH,
    index,
    width
  }
}
