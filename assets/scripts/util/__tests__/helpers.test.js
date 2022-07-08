/* eslint-env jest */
import { normalizeSlug, isExternalUrl } from '../helpers'

describe('normalizeSlug()', () => {
  it('returns nothing if the slug is blank', () => {
    expect(normalizeSlug(undefined)).toBe(undefined)
  })

  it('handles basic test cases', () => {
    expect(normalizeSlug('UPPERCASE')).toBe('uppercase')
    expect(normalizeSlug('mIxEDcAsE')).toBe('mixedcase')
    expect(normalizeSlug('lowercase')).toBe('lowercase')
    expect(normalizeSlug('this has spaces')).toBe('this-has-spaces')
    expect(normalizeSlug('  remove leading spaces')).toBe(
      'remove-leading-spaces'
    )
    expect(normalizeSlug('remove trailing spaces  ')).toBe(
      'remove-trailing-spaces'
    )
    expect(normalizeSlug('collapse    multiple  spaces')).toBe(
      'collapse-multiple-spaces'
    )
    expect(normalizeSlug('leave-existing-hyphens')).toBe(
      'leave-existing-hyphens'
    )
    expect(normalizeSlug('collapse--multiple---hyphens')).toBe(
      'collapse-multiple-hyphens'
    )
    expect(normalizeSlug('-remove leading hyphens')).toBe(
      'remove-leading-hyphens'
    )
    expect(normalizeSlug('remove trailing hyphens--')).toBe(
      'remove-trailing-hyphens'
    )
    expect(normalizeSlug('(drops| "extra" ^%#@$={punctuation}...)!?')).toBe(
      'drops-extra-punctuation'
    )
    expect(normalizeSlug('leaves 😎 emoji💙👌')).toBe('leaves-😎-emoji💙👌')
    expect(normalizeSlug('99 preserve numbers 00')).toBe(
      '99-preserve-numbers-00'
    )
  })

  it('handles foreign languages', () => {
    // Converts accented characters to ASCII (unaccented) equivalent
    expect(normalizeSlug('Ulice s háčky a čárkami')).toBe(
      'ulice-s-hacky-a-carkami'
    )
    // Preserves text in other scripts
    expect(normalizeSlug('王府井大街')).toBe('王府井大街')
  })

  it('handles some other real world test cases', () => {
    expect(normalizeSlug('8 Oriente / 18 de Septiembre')).toBe(
      '8-oriente-18-de-septiembre'
    )
  })
})

describe('isExternalUrl()', () => {
  beforeAll(() => {
    global.window = Object.create(window)

    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'streetmix.net'
      }
    })
  })

  it('handles same hostname cases', () => {
    expect(isExternalUrl('http://streetmix.net')).toBeFalsy()
    expect(isExternalUrl('http://streetmix.net/with/path/params')).toBeFalsy()
    expect(isExternalUrl('http://streetmix.net/?with=queryParam')).toBeFalsy()
    expect(isExternalUrl('http://streetmix.net/#withHash')).toBeFalsy()

    expect(isExternalUrl('https://streetmix.net')).toBeFalsy()
    expect(isExternalUrl('https://streetmix.net/with/path/params')).toBeFalsy()
    expect(isExternalUrl('https://streetmix.net/?with=queryParam')).toBeFalsy()
    expect(isExternalUrl('https://streetmix.net/#withHash')).toBeFalsy()
  })

  it('handles different hostname cases', () => {
    expect(isExternalUrl('http://example.com')).toBeTruthy()
    expect(isExternalUrl('http://example.com/with/path/params')).toBeTruthy()
    expect(isExternalUrl('http://example.com/?with=queryParam')).toBeTruthy()
    expect(isExternalUrl('http://example.com/#withHash')).toBeTruthy()

    expect(isExternalUrl('https://example.com')).toBeTruthy()
    expect(isExternalUrl('https://example.com/with/path/params')).toBeTruthy()
    expect(isExternalUrl('https://example.com/?with=queryParam')).toBeTruthy()
    expect(isExternalUrl('https://example.com/#withHash')).toBeTruthy()
  })

  it('handles relative cases', () => {
    expect(isExternalUrl('/with/path/params')).toBeFalsy()
    expect(isExternalUrl('#hash')).toBeFalsy()
  })
})
