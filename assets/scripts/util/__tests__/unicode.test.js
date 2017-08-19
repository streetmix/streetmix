/* eslint-env jest */
import { needsUnicodeFont } from '../unicode'

describe('util/unicode', () => {
  it('does not require unicode font for basic string', () => {
    const value = needsUnicodeFont('foo')
    expect(value).toEqual(false)
  })

  it('requires unicode font for a string with certain characters', () => {
    const value = needsUnicodeFont('あいうえお')
    expect(value).toEqual(true)
  })
})
