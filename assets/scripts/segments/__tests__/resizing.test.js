/* eslint-env jest */
import { normalizeSegmentWidth, normalizeAllSegmentWidths, resolutionForResizeType } from '../resizing'

describe('normalizeSegmentWidth', () => {
  it('constrains to minimum segment width', () => {
    expect(normalizeSegmentWidth(0.1, 0.25)).toBe(0.75)
  })

  it('constrains to maximum segment width', () => {
    expect(normalizeSegmentWidth(5000, 0.25)).toBe(400)
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
      { width: 2.95, foo: 'baz' },
      { width: 3.33, foo: 'foo' },
      { width: 4.667, foo: 'qux' }
    ]
    expect(normalizeAllSegmentWidths(segments, 1)).toEqual([
      { width: 0.75, foo: 'bar' },
      { width: 3, foo: 'baz' },
      { width: 3.25, foo: 'foo' },
      { width: 4.75, foo: 'qux' }
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
      { width: 0.75, foo: 'bar' },
      { width: 2, foo: 'baz' },
      { width: 3, foo: 'foo' },
      { width: 4, foo: 'qux' }
    ])
  })
})

describe('resolutionForResizeType', () => {
  it('returns a default resolution when arguments are undefined', () => {
    // Just expect any number
    expect(resolutionForResizeType()).toBeGreaterThan(0)
    expect(resolutionForResizeType(undefined, 1)).toBeGreaterThan(0)
    expect(resolutionForResizeType(1, undefined)).toBeGreaterThan(0)
  })
})
