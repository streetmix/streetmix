import {
  normalizeSegmentWidth,
  normalizeAllSegmentWidths,
  resolutionForResizeType
} from '../resizing'

describe('normalizeSegmentWidth', () => {
  it('constrains to minimum segment width', () => {
    expect(normalizeSegmentWidth(0.1, 0.25)).toBe(0.25)
  })

  it('constrains to maximum segment width', () => {
    expect(normalizeSegmentWidth(400, 0.25)).toBe(120)
  })

  it('rounds to nearest resolution', () => {
    // Rounds down
    expect(normalizeSegmentWidth(50.26, 0.25)).toBe(50.25)

    // Rounds up
    expect(normalizeSegmentWidth(50.19, 0.25)).toBe(50.25)
  })
})

describe('normalizeAllSegmentWidths', () => {
  it('normalizes an array of segments (metric)', () => {
    const segments = [
      { width: 0.1, foo: 'bar' },
      { width: 2.985, foo: 'baz' },
      { width: 3.31, foo: 'foo' },
      { width: 4.667, foo: 'qux' }
    ]
    expect(normalizeAllSegmentWidths(segments, 0)).toEqual([
      { width: 0.25, foo: 'bar' },
      { width: 3, foo: 'baz' },
      { width: 3.3, foo: 'foo' },
      { width: 4.65, foo: 'qux' }
    ])
  })

  it('normalizes an array of segments (imperial)', () => {
    const segments = [
      { width: 0.1, foo: 'bar' },
      { width: 2.1, foo: 'baz' },
      { width: 3.1, foo: 'foo' },
      { width: 4.1, foo: 'qux' }
    ]
    expect(normalizeAllSegmentWidths(segments, 1)).toEqual([
      { width: 0.229, foo: 'bar' }, // 0.75 ft
      { width: 2.134, foo: 'baz' }, // 7 ft
      { width: 3.124, foo: 'foo' }, // 10.25 ft
      { width: 4.115, foo: 'qux' } // 13.5 ft
    ])
  })
})

describe('resolutionForResizeType', () => {
  // TODO: Remove when converted to Typescript
  it('returns a default resolution when arguments are undefined', () => {
    // Just expect any number
    expect(resolutionForResizeType()).toBeGreaterThan(0)
    expect(resolutionForResizeType(undefined, 1)).toBeGreaterThan(0)
    expect(resolutionForResizeType(1, undefined)).toBeGreaterThan(0)
  })
})
