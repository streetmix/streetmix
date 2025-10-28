import { applyWarningsToSlices } from './warnings'
import { recalculateWidth } from './width'

describe('applyWarningsToSlices', () => {
  it('applies no warnings', () => {
    const street = {
      width: 20,
      segments: [{ width: 4 }, { width: 8 }, { width: 8 }]
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(street, widths)).toEqual([
      { width: 4, warnings: [false, false, false, false, false, false] },
      { width: 8, warnings: [false, false, false, false, false, false] },
      { width: 8, warnings: [false, false, false, false, false, false] }
    ])
  })

  it('applies warnings to overoccupied street', () => {
    const street = {
      width: 20,
      segments: [{ width: 8 }, { width: 6 }, { width: 8 }]
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(street, widths)).toEqual([
      { width: 8, warnings: [false, true, false, false, false, false] },
      { width: 6, warnings: [false, false, false, false, false, false] },
      { width: 8, warnings: [false, true, false, false, false, false] }
    ])
  })

  it('applies warnings for slices above max width or below min width', () => {
    const street = {
      width: 20,
      segments: [
        { width: 0.6, type: 'sidewalk', variantString: 'normal' },
        { width: 3, type: 'divider', variantString: 'bush' },
        { width: 5.4, type: 'parking-lane', variantString: 'inbound|left' }
      ]
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(street, widths)).toEqual([
      {
        width: 0.6,
        type: 'sidewalk',
        variantString: 'normal',
        warnings: [false, false, true, false, false, false]
      },
      {
        width: 3,
        type: 'divider',
        variantString: 'bush',
        warnings: [false, false, false, false, false, false]
      },
      {
        width: 5.4,
        type: 'parking-lane',
        variantString: 'inbound|left',
        warnings: [false, false, false, true, false, false]
      }
    ])
  })

  it('applies a warning for a dangerous condition', () => {
    const street = {
      width: 20,
      segments: [
        { width: 3, type: 'drive-lane', variantString: 'inbound|car-with-bike' }
      ]
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(street, widths)).toEqual([
      {
        width: 3,
        type: 'drive-lane',
        variantString: 'inbound|car-with-bike',
        warnings: [false, false, false, false, true, false]
      }
    ])
  })

  it('applies a warning for exceeding maximum slope', () => {
    const street = {
      width: 20,
      segments: [
        { width: 3, elevation: 0 },
        { width: 3, slope: true },
        { width: 3, elevation: 4 }
      ]
    }
    const widths = recalculateWidth(street)
    expect(applyWarningsToSlices(street, widths)).toEqual([
      {
        width: 3,
        elevation: 0,
        warnings: [false, false, false, false, false, false]
      },
      {
        width: 3,
        slope: true,
        warnings: [false, false, false, false, false, true]
      },
      {
        width: 3,
        elevation: 4,
        warnings: [false, false, false, false, false, false]
      }
    ])
  })
})
