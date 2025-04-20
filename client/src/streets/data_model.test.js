import { vi } from 'vitest'

import { getLeftHandTraffic } from '../users/localization'
import { createStreetData } from './data_model'
import TEMPLATE from './__mocks__/street_template.yaml'

vi.mock('../users/localization', () => ({
  getLeftHandTraffic: vi.fn(() => false)
}))

function partialStreetDataForSnapshot (data) {
  return {
    units: data.units,
    width: data.width,
    leftBuildingHeight: data.leftBuildingHeight,
    leftBuildingVariant: data.leftBuildingVariant,
    rightBuildingHeight: data.rightBuildingHeight,
    rightBuildingVariant: data.rightBuildingVariant,
    segments: data.segments.map((slice, i) => ({
      id: `segment_${i}`, // Placeholder ID number
      type: slice.type,
      width: slice.width,
      elevation: slice.elevation,
      variant: slice.variant,
      variantString: slice.variantString
    }))
  }
}

describe('createStreetData()', () => {
  it('creates street data from template (metric units)', () => {
    const data = createStreetData(TEMPLATE, 0)
    const snapshot = partialStreetDataForSnapshot(data)
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "leftBuildingHeight": 4,
        "leftBuildingVariant": "narrow",
        "rightBuildingHeight": 3,
        "rightBuildingVariant": "wide",
        "segments": [
          {
            "elevation": 1,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "dense",
            },
            "variantString": "dense",
            "width": 1.8,
          },
          {
            "elevation": 1,
            "id": "segment_1",
            "type": "transit-shelter",
            "variant": {
              "orientation": "left",
              "transit-shelter-elevation": "street-level",
            },
            "variantString": "left|street-level",
            "width": 2.7,
          },
          {
            "elevation": 1,
            "id": "segment_2",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "right",
              "lamp-type": "modern",
            },
            "variantString": "right|modern",
            "width": 0.6,
          },
          {
            "elevation": 0,
            "id": "segment_3",
            "type": "drive-lane",
            "variant": {
              "car-type": "car",
              "direction": "inbound",
            },
            "variantString": "inbound|car",
            "width": 2.7,
          },
          {
            "elevation": 0,
            "id": "segment_4",
            "type": "turn-lane",
            "variant": {
              "direction": "outbound",
              "turn-lane-orientation": "left-straight",
            },
            "variantString": "outbound|left-straight",
            "width": 3,
          },
          {
            "elevation": 0,
            "id": "segment_5",
            "type": "parking-lane",
            "variant": {
              "parking-lane-direction": "outbound",
              "parking-lane-orientation": "right",
            },
            "variantString": "outbound|right",
            "width": 2.1,
          },
          {
            "elevation": 1,
            "id": "segment_6",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "left",
              "lamp-type": "modern",
            },
            "variantString": "left|modern",
            "width": 0.6,
          },
          {
            "elevation": 1,
            "id": "segment_7",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "normal",
            },
            "variantString": "normal",
            "width": 1.8,
          },
        ],
        "units": 0,
        "width": 24,
      }
    `)
  })

  it('creates street data from template (US customary units)', () => {
    const data = createStreetData(TEMPLATE, 1)
    const snapshot = partialStreetDataForSnapshot(data)
    // Result should be same as metric unit test, but width values are
    // adjusted so they create cleaner conversion to feet and inches.
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "leftBuildingHeight": 4,
        "leftBuildingVariant": "narrow",
        "rightBuildingHeight": 3,
        "rightBuildingVariant": "wide",
        "segments": [
          {
            "elevation": 1,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "dense",
            },
            "variantString": "dense",
            "width": 1.829,
          },
          {
            "elevation": 1,
            "id": "segment_1",
            "type": "transit-shelter",
            "variant": {
              "orientation": "left",
              "transit-shelter-elevation": "street-level",
            },
            "variantString": "left|street-level",
            "width": 2.743,
          },
          {
            "elevation": 1,
            "id": "segment_2",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "right",
              "lamp-type": "modern",
            },
            "variantString": "right|modern",
            "width": 0.61,
          },
          {
            "elevation": 0,
            "id": "segment_3",
            "type": "drive-lane",
            "variant": {
              "car-type": "car",
              "direction": "inbound",
            },
            "variantString": "inbound|car",
            "width": 2.743,
          },
          {
            "elevation": 0,
            "id": "segment_4",
            "type": "turn-lane",
            "variant": {
              "direction": "outbound",
              "turn-lane-orientation": "left-straight",
            },
            "variantString": "outbound|left-straight",
            "width": 3.048,
          },
          {
            "elevation": 0,
            "id": "segment_5",
            "type": "parking-lane",
            "variant": {
              "parking-lane-direction": "outbound",
              "parking-lane-orientation": "right",
            },
            "variantString": "outbound|right",
            "width": 2.134,
          },
          {
            "elevation": 1,
            "id": "segment_6",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "left",
              "lamp-type": "modern",
            },
            "variantString": "left|modern",
            "width": 0.61,
          },
          {
            "elevation": 1,
            "id": "segment_7",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "normal",
            },
            "variantString": "normal",
            "width": 1.829,
          },
        ],
        "units": 1,
        "width": 24.384,
      }
    `)
  })

  it('mirrors street data', () => {
    getLeftHandTraffic.mockReturnValueOnce(true)

    const data = createStreetData(TEMPLATE, 0)
    const snapshot = partialStreetDataForSnapshot(data)
    // Same as metric test, but order of segments are reversed, and all
    // variant names that include `orientation` have swapped left for right
    // and vice versa
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "leftBuildingHeight": 4,
        "leftBuildingVariant": "narrow",
        "rightBuildingHeight": 3,
        "rightBuildingVariant": "wide",
        "segments": [
          {
            "elevation": 1,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "normal",
            },
            "variantString": "normal",
            "width": 1.8,
          },
          {
            "elevation": 1,
            "id": "segment_1",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "right",
              "lamp-type": "modern",
            },
            "variantString": "right|modern",
            "width": 0.6,
          },
          {
            "elevation": 0,
            "id": "segment_2",
            "type": "parking-lane",
            "variant": {
              "parking-lane-direction": "outbound",
              "parking-lane-orientation": "left",
            },
            "variantString": "outbound|left",
            "width": 2.1,
          },
          {
            "elevation": 0,
            "id": "segment_3",
            "type": "turn-lane",
            "variant": {
              "direction": "outbound",
              "turn-lane-orientation": "right-straight",
            },
            "variantString": "outbound|right-straight",
            "width": 3,
          },
          {
            "elevation": 0,
            "id": "segment_4",
            "type": "drive-lane",
            "variant": {
              "car-type": "car",
              "direction": "inbound",
            },
            "variantString": "inbound|car",
            "width": 2.7,
          },
          {
            "elevation": 1,
            "id": "segment_5",
            "type": "sidewalk-lamp",
            "variant": {
              "lamp-orientation": "left",
              "lamp-type": "modern",
            },
            "variantString": "left|modern",
            "width": 0.6,
          },
          {
            "elevation": 1,
            "id": "segment_6",
            "type": "transit-shelter",
            "variant": {
              "orientation": "right",
              "transit-shelter-elevation": "street-level",
            },
            "variantString": "right|street-level",
            "width": 2.7,
          },
          {
            "elevation": 1,
            "id": "segment_7",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "dense",
            },
            "variantString": "dense",
            "width": 1.8,
          },
        ],
        "units": 0,
        "width": 24,
      }
    `)
  })
})
