import { getActualLocaleFromRequested } from './locale'

describe('localization', () => {
  describe('getActualLocaleFromRequested', () => {
    it('returns an exact match for an available locale', () => {
      const locale = getActualLocaleFromRequested('ja')
      expect(locale).toBe('ja')
    })

    it('returns the default language match for an unavailable locale', () => {
      const locale = getActualLocaleFromRequested('xx')
      expect(locale).toBe('en')
    })

    it('returns the superset language match for an unavailable region locale', () => {
      const locale = getActualLocaleFromRequested('en-AU')
      expect(locale).toBe('en')
    })

    it('returns the fuzzy language match for an unavailable region locale', () => {
      const locale = getActualLocaleFromRequested('pt-PT')
      expect(locale).toBe('pt-BR')
    })
  })
})
