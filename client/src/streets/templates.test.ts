import { vi } from 'vitest'

import { getLeftHandTraffic } from '../users/localization.js'
import { updateStreetData } from '../store/slices/street.js'
import { prepareStreet } from './templates.js'

import type { SliceItem } from '@streetmix/types'

vi.mock('../users/localization.js', () => ({
  getLeftHandTraffic: vi.fn(() => false),
}))
vi.mock('../store/slices/street.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    updateStreetData: vi.fn(() => ({ type: 'MOCK_ACTION' })),
  }
})

function partialStreetDataForSnapshot(data) {
  return {
    units: data.units,
    width: data.width,
    boundary: {
      left: {
        ...data.boundary.left,
        id: 'left', // Use non-random ID
      },
      right: {
        ...data.boundary.right,
        id: 'right', // Use non-random ID
      },
    },
    segments: data.segments.map((slice: SliceItem, i: number) => ({
      id: `segment_${i}`, // Placeholder ID number
      type: slice.type,
      width: slice.width,
      elevation: slice.elevation,
      variant: slice.variant,
      variantString: slice.variantString,
    })),
  }
}

describe('prepareStreet()', () => {
  afterEach(() => {
    updateStreetData.mockReset()
  })

  // Make sure that this part of the test setup works
  it('fetches template via mocked URL', async () => {
    const response = await fetch('/assets/data/templates/test.yaml')
    const text = await response.text()

    expect(response.ok).toBe(true)
    expect(text.length).toBeGreaterThan(1)
  })

  it('creates street data from template (metric units)', async () => {
    await prepareStreet('test')

    // Extract just the properties we care about comparing from arguments
    const snapshot = partialStreetDataForSnapshot(
      updateStreetData.mock.calls[0][0]
    )
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "boundary": {
          "left": {
            "elevation": 0.15,
            "floors": 4,
            "id": "left",
            "variant": "narrow",
          },
          "right": {
            "elevation": 0.15,
            "floors": 3,
            "id": "right",
            "variant": "wide",
          },
        },
        "segments": [
          {
            "elevation": 0.15,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "dense",
            },
            "variantString": "dense",
            "width": 1.8,
          },
          {
            "elevation": 0.15,
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
            "elevation": 0.15,
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
            "elevation": 0.15,
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
            "elevation": 0.15,
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

  // Result should be same as metric unit test, but width values are adjusted
  // so they create cleaner conversion to feet and inches.
  it('creates street data from template (US customary units)', async () => {
    // `prepareStreet()` usually gets its own units from Redux store, but we can
    // optionally pass it in to override. We only do this in tests.
    await prepareStreet('test', 1)

    const snapshot = partialStreetDataForSnapshot(
      updateStreetData.mock.calls[0][0]
    )
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "boundary": {
          "left": {
            "elevation": 0.152,
            "floors": 4,
            "id": "left",
            "variant": "narrow",
          },
          "right": {
            "elevation": 0.152,
            "floors": 3,
            "id": "right",
            "variant": "wide",
          },
        },
        "segments": [
          {
            "elevation": 0.152,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "dense",
            },
            "variantString": "dense",
            "width": 1.829,
          },
          {
            "elevation": 0.152,
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
            "elevation": 0.152,
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
            "elevation": 0.152,
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
            "elevation": 0.152,
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

  // Same as metric test, but order of slices are reversed, and all variants
  // that include `orientation` have swapped left for right and vice versa
  it('mirrors street data', async () => {
    getLeftHandTraffic.mockReturnValueOnce(true)

    await prepareStreet('test')

    const snapshot = partialStreetDataForSnapshot(
      updateStreetData.mock.calls[0][0]
    )
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "boundary": {
          "left": {
            "elevation": 0.15,
            "floors": 4,
            "id": "left",
            "variant": "narrow",
          },
          "right": {
            "elevation": 0.15,
            "floors": 3,
            "id": "right",
            "variant": "wide",
          },
        },
        "segments": [
          {
            "elevation": 0.15,
            "id": "segment_0",
            "type": "sidewalk",
            "variant": {
              "sidewalk-density": "normal",
            },
            "variantString": "normal",
            "width": 1.8,
          },
          {
            "elevation": 0.15,
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
            "elevation": 0.15,
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
            "elevation": 0.15,
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
            "elevation": 0.15,
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
