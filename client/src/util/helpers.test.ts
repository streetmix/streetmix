import { normalizeSlug, isUrlExternal } from './helpers'

const SELF_HOSTNAME = 'streetmix.net'

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

describe('isUrlExternal()', () => {
  it('handles same hostname cases', () => {
    expect(isUrlExternal('http://streetmix.net', SELF_HOSTNAME)).toBeFalsy()
    expect(
      isUrlExternal('http://streetmix.net/with/path/params', SELF_HOSTNAME)
    ).toBeFalsy()
    expect(
      isUrlExternal('http://streetmix.net/?with=queryParam', SELF_HOSTNAME)
    ).toBeFalsy()
    expect(
      isUrlExternal('http://streetmix.net/#withHash', SELF_HOSTNAME)
    ).toBeFalsy()

    expect(isUrlExternal('https://streetmix.net', SELF_HOSTNAME)).toBeFalsy()
    expect(
      isUrlExternal('https://streetmix.net/with/path/params', SELF_HOSTNAME)
    ).toBeFalsy()
    expect(
      isUrlExternal('https://streetmix.net/?with=queryParam', SELF_HOSTNAME)
    ).toBeFalsy()
    expect(
      isUrlExternal('https://streetmix.net/#withHash', SELF_HOSTNAME)
    ).toBeFalsy()
  })

  it('handles different hostname cases', () => {
    expect(isUrlExternal('http://example.com', SELF_HOSTNAME)).toBeTruthy()
    expect(
      isUrlExternal('http://example.com/with/path/params', SELF_HOSTNAME)
    ).toBeTruthy()
    expect(
      isUrlExternal('http://example.com/?with=queryParam', SELF_HOSTNAME)
    ).toBeTruthy()
    expect(
      isUrlExternal('http://example.com/#withHash', SELF_HOSTNAME)
    ).toBeTruthy()

    expect(isUrlExternal('https://example.com', SELF_HOSTNAME)).toBeTruthy()
    expect(
      isUrlExternal('https://example.com/with/path/params', SELF_HOSTNAME)
    ).toBeTruthy()
    expect(
      isUrlExternal('https://example.com/?with=queryParam', SELF_HOSTNAME)
    ).toBeTruthy()
    expect(
      isUrlExternal('https://example.com/#withHash', SELF_HOSTNAME)
    ).toBeTruthy()
  })

  it('handles relative cases', () => {
    expect(isUrlExternal('/with/path/params', SELF_HOSTNAME)).toBeFalsy()
    expect(isUrlExternal('#hash', SELF_HOSTNAME)).toBeFalsy()
  })
})
