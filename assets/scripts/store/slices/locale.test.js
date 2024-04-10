import locale, { changeLocale } from './locale'

describe('locale reducer', () => {
  const initialState = {
    locale: 'en',
    messages: {},
    segmentInfo: {},
    isLoading: false,
    requestedLocale: null
  }

  it('should handle initial state', () => {
    expect(locale(undefined, {})).toEqual(initialState)
  })

  describe('changeLocale()', () => {
    it('should handle the pending state', () => {
      expect(
        locale(initialState, changeLocale.pending('requestId', 'pt-BR'))
      ).toEqual({
        locale: 'en',
        messages: {},
        segmentInfo: {},
        isLoading: true,
        requestedLocale: 'pt-BR'
      })
    })

    it('should handle the fulfilled state', () => {
      expect(
        locale(
          initialState,
          changeLocale.fulfilled({
            locale: 'pt-BR',
            translation: {
              messages: {
                foo: {
                  bar: 'baz',
                  qux: 'bar'
                },
                qux: {
                  baz: {
                    bar: 'foo {boop}'
                  }
                }
              }
            }
          })
        )
      ).toEqual({
        locale: 'pt-BR',
        messages: {
          'foo.bar': 'baz',
          'foo.qux': 'bar',
          'qux.baz.bar': 'foo {boop}'
        },
        segmentInfo: {},
        isLoading: false,
        requestedLocale: null
      })
    })

    it('should handle the rejected state()', () => {
      expect(
        locale(initialState, changeLocale.rejected('requestId', 'pt-BR'))
      ).toEqual({
        locale: 'en',
        messages: {},
        segmentInfo: {},
        isLoading: false,
        requestedLocale: null
      })
    })
  })
})
