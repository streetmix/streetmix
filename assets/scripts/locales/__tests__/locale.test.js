/* eslint-env jest */
import { getActualLocaleFromRequested } from '../locale'

jest.mock('../../../../app/data/locales.json', () => {
  return [
    {
      value: 'en',
      level: 4
    },
    {
      value: 'ja',
      level: 4
    },
    {
      value: 'pt-BR',
      level: 4
    }
  ]
})

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
