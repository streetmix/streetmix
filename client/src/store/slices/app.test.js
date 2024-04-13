import app, {
  setAppFlags,
  startPrinting,
  stopPrinting,
  everythingLoaded
} from './app'
import { changeLocale } from './locale'

describe('app reducer', () => {
  const initialState = {
    readOnly: false,
    printing: false,
    everythingLoaded: false,
    contentDirection: 'ltr',
    priorLastStreetId: null
  }

  it('should handle initial state', () => {
    expect(app(undefined, {})).toEqual(initialState)
  })

  it('should handle setAppFlags()', () => {
    expect(
      app(
        initialState,
        setAppFlags({
          readOnly: true,
          priorLastStreetId: '1'
        })
      )
    ).toEqual({
      readOnly: true,
      printing: false,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: '1'
    })
  })

  it('should handle startPrinting()', () => {
    expect(app(initialState, startPrinting())).toEqual({
      readOnly: false,
      printing: true,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: null
    })
  })

  it('should handle stopPrinting()', () => {
    expect(
      app(
        {
          readOnly: false,
          printing: true,
          everythingLoaded: false,
          contentDirection: 'ltr',
          priorLastStreetId: null
        },
        stopPrinting()
      )
    ).toEqual({
      readOnly: false,
      printing: false,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: null
    })
  })

  it('should handle everythingLoaded()', () => {
    expect(app(initialState, everythingLoaded())).toEqual({
      readOnly: false,
      printing: false,
      everythingLoaded: true,
      contentDirection: 'ltr',
      priorLastStreetId: null
    })
  })

  describe('should handle extra reducers', () => {
    it('should set rtl content direction on locale change', () => {
      expect(
        app(
          initialState,
          changeLocale.fulfilled({
            locale: 'ar'
          })
        )
      ).toEqual({
        readOnly: false,
        printing: false,
        everythingLoaded: false,
        contentDirection: 'rtl',
        priorLastStreetId: null
      })
    })

    it('should set ltr content direction on locale change', () => {
      expect(
        app(
          {
            readOnly: false,
            printing: false,
            everythingLoaded: true,
            contentDirection: 'rtl',
            priorLastStreetId: null
          },
          changeLocale.fulfilled({
            locale: 'en'
          })
        )
      ).toEqual({
        readOnly: false,
        printing: false,
        everythingLoaded: true,
        contentDirection: 'ltr',
        priorLastStreetId: null
      })
    })
  })
})
