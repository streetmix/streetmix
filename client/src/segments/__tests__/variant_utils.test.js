import { getVariantArray, getVariantString } from '../variant_utils'

describe('getVariantArray', () => {
  it('returns an object', () => {
    const result = getVariantArray('streetcar', 'inbound|regular')
    expect(result).toEqual({
      direction: 'inbound',
      'public-transit-asphalt': 'regular'
    })
  })

  it('returns an empty object if the segment is not found', () => {
    const result = getVariantArray('foo', '')
    expect(result).toEqual({})
  })
})

describe('getVariantString', () => {
  it('returns a string', () => {
    const obj = { direction: 'inbound', 'public-transit-asphalt': 'regular' }
    const result = getVariantString(obj)
    expect(result).toEqual('inbound|regular')
  })
})
