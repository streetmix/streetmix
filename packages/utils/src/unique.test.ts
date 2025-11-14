import { unique } from './unique.js'

describe('unique()', () => {
  it('returns an array of unique values', () => {
    const array = [1, 'a', '1', 'a', 'b', 1, 1, { x: 1 }, 'a', { x: 1 }]
    expect(unique(array)).toEqual([1, 'a', '1', 'b', { x: 1 }, { x: 1 }])
  })
})
