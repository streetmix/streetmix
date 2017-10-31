import { getAbortEverything } from '../app/initialization'
import { msg } from '../app/messages'
import { URL_NO_USER, RESERVED_URLS, URL_RESERVED_PREFIX } from '../app/routing'
import {
  DEFAULT_BUILDING_HEIGHT_LEFT,
  DEFAULT_BUILDING_HEIGHT_RIGHT,
  DEFAULT_BUILDING_VARIANT_EMPTY,
  DEFAULT_BUILDING_HEIGHT_EMPTY,
  DEFAULT_BUILDING_VARIANT_RIGHT,
  DEFAULT_BUILDING_VARIANT_LEFT,
  createBuildings,
  updateBuildingPosition
} from '../segments/buildings'
import { DEFAULT_SEGMENTS } from '../segments/default'
import { SEGMENT_INFO } from '../segments/info'
import { normalizeAllSegmentWidths } from '../segments/resizing'
import { getVariantString, getVariantArray } from '../segments/variant_utils'
import {
  segmentsChanged,
  repositionSegments,
  createSegmentDom
} from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getUnits, getLeftHandTraffic, propagateUnits } from '../users/localization'
import { normalizeSlug } from '../util/helpers'
import { generateRandSeed } from '../util/random'
import { updateStreetName } from './name'
import {
  setUndoStack,
  setUndoPosition,
  getIgnoreStreetChanges,
  setIgnoreStreetChanges,
  createNewUndoIfNecessary,
  unifyUndoStack,
  updateUndoButtons
} from './undo_stack'
import {
  DEFAULT_STREET_WIDTH,
  normalizeStreetWidth,
  resizeStreetWidth
} from './width'
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'
import { updateStreetData } from '../store/actions/street'
import store from '../store'

let _lastStreet

export function getLastStreet () {
  return _lastStreet
}

export function setLastStreet (value) {
  _lastStreet = value
}

const LATEST_SCHEMA_VERSION = 17
// 1: starting point
// 2: adding leftBuildingHeight and rightBuildingHeight
// 3: adding leftBuildingVariant and rightBuildingVariant
// 4: adding transit shelter elevation
// 5: adding another lamp type (traditional)
// 6: colored streetcar lanes
// 7: colored bus and light rail lanes
// 8: colored bike lane
// 9: second car type: truck
// 10: sidewalk density
// 11: unify median and planting strip into divider
// 12: getting rid of small tree
// 13: bike rack elevation
// 14: wayfinding has three types
// 15: sidewalks have rand seed
// 16: stop saving undo stack
// 17: alternative colors for bike lanes

export const DEFAULT_NAME = msg('DEFAULT_STREET_NAME')

let street = {
  schemaVersion: LATEST_SCHEMA_VERSION,

  id: null,
  creatorId: null,
  namespacedId: null,
  originalStreetId: null, // id of the street the current street is remixed from (could be null)
  name: null,
  editCount: null, // Since new street or remix · FIXME: can be null (meaning = don’t touch), but this will change

  width: null,
  occupiedWidth: null, // Can be recreated, do not save
  remainingWidth: null, // Can be recreated, do not save

  leftBuildingHeight: null,
  rightBuildingHeight: null,
  leftBuildingVariant: null,
  rightBuildingVariant: null,

  segments: [],

  units: null
}

export function getStreet () {
  return street
}

export function setStreet (value) {
  street = value
  setStreetDataInRedux()
}

export function setAndSaveStreet (value) {
  setStreet(value)
  saveStreetToServerIfNecessary()
}

function incrementSchemaVersion (street) {
  let segment, variant
  if (!street.schemaVersion) {
    street.schemaVersion = 1
  }

  switch (street.schemaVersion) {
    case 1:
      street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT
      street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT
      break
    case 2:
      street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT
      street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT
      break
    case 3:
      for (var i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'transit-shelter') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['transit-shelter-elevation'] = 'street-level'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 4:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-lamp') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['lamp-type'] = 'modern'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 5:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'streetcar') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['public-transit-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 6:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bus-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bus-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        } else if (segment.type === 'light-rail') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['public-transit-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 7:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 8:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['car-type'] = 'car'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 9:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['sidewalk-density'] = 'normal'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 10:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'planting-strip') {
          segment.type = 'divider'

          if (segment.variantString === '') {
            segment.variantString = 'planting-strip'
          }
        } else if (segment.type === 'small-median') {
          segment.type = 'divider'
          segment.variantString = 'median'
        }
      }
      break
    case 11:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'divider') {
          if (segment.variantString === 'small-tree') {
            segment.variantString = 'big-tree'
          }
        } else if (segment.type === 'sidewalk-tree') {
          if (segment.variantString === 'small') {
            segment.variantString = 'big'
          }
        }
      }
      break
    case 12:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-bike-rack') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-rack-elevation'] = 'sidewalk'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 13:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-wayfinding') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['wayfinding-type'] = 'large'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 14:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          segment.randSeed = 35
        }
      }
      break
    case 15:
      setUndoStack([])
      setUndoPosition(0)
      break
    case 16:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          if (variant['bike-asphalt'] === 'colored') {
            variant['bike-asphalt'] = 'green'
          }
          segment.variantString = getVariantString(variant)
        }
      }
      break
  }

  street.schemaVersion++
}

export function updateToLatestSchemaVersion (street) {
  var updated = false
  while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
    incrementSchemaVersion(street)
    updated = true
  }

  return updated
}

export function createDomFromData () {
  document.querySelector('#street-section-editable').innerHTML = ''

  for (var i in street.segments) {
    var segment = street.segments[i]

    var el = createSegmentDom(segment)
    document.querySelector('#street-section-editable').appendChild(el)

    segment.el = el
    segment.el.dataNo = i
  }

  repositionSegments()
  updateBuildingPosition()
  createBuildings()
}

export function setStreetCreatorId (newId) {
  street.creatorId = newId

  unifyUndoStack()
  updateLastStreetInfo()
}

export function setUpdateTimeToNow () {
  street.updatedAt = new Date().getTime()
  unifyUndoStack()
}

export function saveStreetToServerIfNecessary () {
  if (getIgnoreStreetChanges() || getAbortEverything()) {
    return
  }

  var currentData = trimStreetData(street)

  if (JSON.stringify(currentData) !== JSON.stringify(_lastStreet)) {
    if (street.editCount !== null) {
      street.editCount++
    }
    setUpdateTimeToNow()

    // Some parts of the UI need to know this happened to respond to it
    // TODO: figure out appropriate event name
    window.dispatchEvent(new window.CustomEvent('stmx:save_street'))

    createNewUndoIfNecessary(_lastStreet, currentData)

    scheduleSavingStreetToServer()

    _lastStreet = currentData

    updateUndoButtons()
  }

  setStreetDataInRedux()
}

// Update in Redux store. Some components will read street data from there.
// todo: transition so Redux is single source of truth for street.
export function setStreetDataInRedux () {
  store.dispatch(updateStreetData(street))
}

// Copies only the data necessary for save/undo.
export function trimStreetData (street) {
  var newData = {}

  newData.schemaVersion = street.schemaVersion

  newData.width = street.width
  newData.name = street.name

  newData.id = street.id
  newData.namespacedId = street.namespacedId
  newData.creatorId = street.creatorId
  newData.originalStreetId = street.originalStreetId
  newData.units = street.units

  if (street.editCount !== null) {
    // console.log('saving editCount', street.editCount)
    newData.editCount = street.editCount
  } else {
    // console.log('not saving editCount')
  }

  newData.leftBuildingHeight = street.leftBuildingHeight
  newData.rightBuildingHeight = street.rightBuildingHeight
  newData.leftBuildingVariant = street.leftBuildingVariant
  newData.rightBuildingVariant = street.rightBuildingVariant

  newData.segments = []

  for (var i in street.segments) {
    var segment = {}
    segment.type = street.segments[i].type
    segment.variantString = street.segments[i].variantString
    segment.width = street.segments[i].width
    if (street.segments[i].randSeed) {
      segment.randSeed = street.segments[i].randSeed
    }

    newData.segments.push(segment)
  }

  return newData
}

// TODO this function should not exist; all the data should be in street.
// object to begin with
export function createDataFromDom () {
  var els = document.querySelectorAll('#street-section-editable > .segment')

  street.segments = []

  for (var i = 0, el; el = els[i]; i++) { // eslint-disable-line no-cond-assign
    var segment = {}
    segment.type = el.getAttribute('type')
    if (el.getAttribute('rand-seed')) {
      segment.randSeed = parseInt(el.getAttribute('rand-seed'))
    }
    segment.variantString = el.getAttribute('variant-string')
    segment.variant = getVariantArray(segment.type, segment.variantString)
    segment.width = parseFloat(el.getAttribute('data-width'))
    segment.el = el
    segment.warnings = []
    street.segments.push(segment)
  }
}

function fillDefaultSegments () {
  street.segments = []
  let leftHandTraffic = getLeftHandTraffic()

  for (var i in DEFAULT_SEGMENTS[leftHandTraffic]) {
    var segment = DEFAULT_SEGMENTS[leftHandTraffic][i]
    segment.warnings = []
    segment.variantString = getVariantString(segment.variant)

    if (SEGMENT_INFO[segment.type].needRandSeed) {
      segment.randSeed = generateRandSeed()
    }

    street.segments.push(segment)
  }

  normalizeAllSegmentWidths()
}

export function getStreetUrl (street) {
  var url = '/'

  if (street.creatorId) {
    if (RESERVED_URLS.indexOf(street.creatorId) !== -1) {
      url += URL_RESERVED_PREFIX
    }

    url += street.creatorId
  } else {
    url += URL_NO_USER
  }

  url += '/'

  url += street.namespacedId

  if (street.creatorId) {
    var slug = normalizeSlug(street.name)
    url += '/' + encodeURIComponent(slug)
  }

  return url
}

export function prepareDefaultStreet () {
  street.units = getUnits()
  propagateUnits()
  street.name = DEFAULT_NAME
  street.width = normalizeStreetWidth(DEFAULT_STREET_WIDTH)
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT
  street.editCount = 0
  // console.log('editCount = 0 on default street')
  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  }

  fillDefaultSegments()

  setUpdateTimeToNow()
}

export function prepareEmptyStreet () {
  street.units = getUnits()
  propagateUnits()

  street.name = DEFAULT_NAME
  street.width = normalizeStreetWidth(DEFAULT_STREET_WIDTH)
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY
  street.editCount = 0
  // console.log('editCount = 0 on empty street!')
  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  }

  street.segments = []

  setUpdateTimeToNow()
}

/**
 * @todo: documentation
 *
 * @param {Boolean} dontScroll - document this
 * @param {Boolean} save - if set to `false`, calling this function will not
 *          cause a re-save of street to the server. (e.g. in the case of
 *          live update feature.) Default is `true`.
 */
export function updateEverything (dontScroll, save = true) {
  setIgnoreStreetChanges(true)
  propagateUnits()
  // TODO Verify that we don't need to dispatch an update width event here
  createDomFromData()
  segmentsChanged()
  resizeStreetWidth(dontScroll)
  updateStreetName()
  setIgnoreStreetChanges(false)
  updateUndoButtons()
  _lastStreet = trimStreetData(street)

  if (save === true) {
    scheduleSavingStreetToServer()
  }
}
