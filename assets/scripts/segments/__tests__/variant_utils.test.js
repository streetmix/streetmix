/* eslint-env jest */
import { getVariantArray, getVariantString } from '../variant_utils'

describe('getVariantArray', () => {
  it('returns an object', () => {
    const result = getVariantArray('streetcar', 'inbound|regular')
    expect(result).toEqual({ 'direction': 'inbound', 'public-transit-asphalt': 'regular' })
  })
})

describe('getVariantString', () => {
  it('returns a string', () => {
    const obj = { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
    const result = getVariantString(obj)
    expect(result).toEqual('inbound|regular')
  })
})
