import { applyWarningsToSlices } from './warnings.js'
import { recalculateWidth } from './width.js'

describe('applyWarningsToSlices', () => {
  it('applies no warnings', () => {
    const slices = [
      { width: 4, slope: { on: false }, warnings: [false] },
      { width: 8, slope: { on: false }, warnings: [false] },
      { width: 8, slope: { on: false }, warnings: [false] },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(slices, street, widths)).toEqual([
      {
        width: 4,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
      {
        width: 8,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
      {
        width: 8,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
    ])
  })

  it('applies warnings to overoccupied street', () => {
    const slices = [
      { width: 8, slope: { on: false }, warnings: [false] },
      { width: 6, slope: { on: false }, warnings: [false] },
      { width: 8, slope: { on: false }, warnings: [false] },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(slices, street, widths)).toEqual([
      {
        width: 8,
        slope: { on: false },
        warnings: [false, true, false, false, false, false, false],
      },
      {
        width: 6,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
      {
        width: 8,
        slope: { on: false },
        warnings: [false, true, false, false, false, false, false],
      },
    ])
  })

  it('applies warnings for slices above max width or below min width', () => {
    const slices = [
      {
        width: 0.6,
        type: 'sidewalk',
        variantString: 'normal',
        slope: { on: false },
        warnings: [false],
      },
      {
        width: 3,
        type: 'divider',
        variantString: 'bush',
        slope: { on: false },
        warnings: [false],
      },
      {
        width: 5.4,
        type: 'parking-lane',
        variantString: 'inbound|left',
        slope: { on: false },
        warnings: [false],
      },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(slices, street, widths)).toEqual([
      {
        width: 0.6,
        type: 'sidewalk',
        variantString: 'normal',
        slope: { on: false },
        warnings: [false, false, true, false, false, false, false],
      },
      {
        width: 3,
        type: 'divider',
        variantString: 'bush',
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
      {
        width: 5.4,
        type: 'parking-lane',
        variantString: 'inbound|left',
        slope: { on: false },
        warnings: [false, false, false, true, false, false, false],
      },
    ])
  })

  it('applies a warning for a dangerous condition', () => {
    const slices = [
      {
        width: 3,
        type: 'drive-lane',
        variantString: 'inbound|car-with-bike',
        slope: { on: false },
        warnings: [false],
      },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(slices, street, widths)).toEqual([
      {
        width: 3,
        type: 'drive-lane',
        variantString: 'inbound|car-with-bike',
        slope: { on: false },
        warnings: [false, false, false, false, true, false, false],
      },
    ])
  })

  it('applies a warning for exceeding maximum slope', () => {
    const slices = [
      { width: 3, elevation: 0, slope: { on: false }, warnings: [false] },
      {
        width: 3,
        type: 'divider',
        variantString: 'planting-strip',
        slope: { on: true, values: [0, 4] },
        warnings: [false],
      },
      { width: 3, elevation: 4, slope: { on: false }, warnings: [false] },
    ]
    const street = {
      width: 20,
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: slices,
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(slices, street, widths)).toEqual([
      {
        width: 3,
        elevation: 0,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
      {
        width: 3,
        type: 'divider',
        variantString: 'planting-strip',
        slope: { on: true, values: [0, 4] },
        warnings: [false, false, false, false, false, true, true],
      },
      {
        width: 3,
        elevation: 4,
        slope: { on: false },
        warnings: [false, false, false, false, false, false, false],
      },
    ])
  })
})
