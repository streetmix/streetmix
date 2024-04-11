import { maxBy } from '../maxBy'

describe('maxBy()', () => {
  it('returns the object with the highest value property', () => {
    const objs = [
      { a: 1 },
      { a: 3 },
      { a: 4 },
      { a: 5 },
      { a: null },
      { a: 9 },
      { a: 1 }
    ]
    expect(maxBy(objs, (o) => o.a)).toEqual({ a: 9 })
  })
})
