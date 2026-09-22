import { applyWarningsToSlices } from './warnings.js'
import { recalculateWidth } from './width.js'

describe('applyWarningsToSlices', () => {
  it('applies no warnings', () => {
    const slices = [
      { id: 'a', width: 4, slope: { on: false } },
      { id: 'b', width: 8, slope: { on: false } },
      { id: 'c', width: 8, slope: { on: false } },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)

    expect(applyWarningsToSlices(slices, street, widths)).toEqual({
      a: {},
      b: {},
      c: {},
    })
  })

  it('applies warnings to overoccupied street', () => {
    const slices = [
      { id: 'a', width: 8, slope: { on: false } },
      { id: 'b', width: 6, slope: { on: false } },
      { id: 'c', width: 8, slope: { on: false } },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)

    expect(applyWarningsToSlices(slices, street, widths)).toEqual({
      a: {
        outOfBounds: true,
      },
      b: {},
      c: {
        outOfBounds: true,
      },
    })
  })

  it('applies warnings for slices above max width or below min width', () => {
    const slices = [
      {
        id: 'a',
        width: 0.6,
        type: 'sidewalk',
        variantString: 'normal',
        slope: { on: false },
      },
      {
        id: 'b',
        width: 3,
        type: 'divider',
        variantString: 'bush',
        slope: { on: false },
      },
      {
        id: 'c',
        width: 5.4,
        type: 'parking-lane',
        variantString: 'inbound|left',
        slope: { on: false },
      },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)

    expect(applyWarningsToSlices(slices, street, widths)).toEqual({
      a: {
        tooNarrow: true,
      },
      b: {},
      c: {
        tooWide: true,
      },
    })
  })

  it('applies a warning for a dangerous condition', () => {
    const slices = [
      {
        id: 'a',
        width: 3,
        type: 'drive-lane',
        variantString: 'inbound|car-with-bike',
        slope: { on: false },
      },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)

    expect(applyWarningsToSlices(slices, street, widths)).toEqual({
      a: {
        dangerousExisting: true,
      },
    })
  })

  it('applies a warning for exceeding maximum slope', () => {
    const slices = [
      { id: 'a', width: 3, elevation: 0, slope: { on: false } },
      {
        id: 'b',
        width: 3,
        type: 'divider',
        variantString: 'planting-strip',
        slope: { on: true, values: [0, 4] },
      },
      { id: 'c', width: 3, elevation: 4, slope: { on: false } },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)

    expect(applyWarningsToSlices(slices, street, widths)).toEqual({
      a: {},
      b: {
        slopeBermExceeded: true,
        slopePathExceeded: true,
      },
      c: {},
    })
  })
})
