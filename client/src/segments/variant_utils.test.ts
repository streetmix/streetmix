import { getVariantInfo, getVariantString } from './variant_utils'

describe('getVariantInfo', () => {
  it('returns an object', () => {
    const result = getVariantInfo('streetcar', 'inbound|regular')
    expect(result).toEqual({
      direction: 'inbound',
      'public-transit-asphalt': 'regular'
    })
  })

  it('returns an empty object if the segment is not found', () => {
    const result = getVariantInfo('foo', '')
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
