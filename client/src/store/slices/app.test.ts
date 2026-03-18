import app, {
  setAppFlags,
  startPrinting,
  stopPrinting,
  everythingLoaded,
} from './app.js'
import { changeLocale } from './locale.js'

describe('app reducer', () => {
  const initialState = {
    readOnly: false,
    printing: false,
    everythingLoaded: false,
    contentDirection: 'ltr' as const,
    priorLastStreetId: null,
    activeTour: false,
  }

  it('should handle setAppFlags()', () => {
    expect(
      app(
        initialState,
        setAppFlags({
          readOnly: true,
          priorLastStreetId: '1',
        })
      )
    ).toEqual({
      readOnly: true,
      printing: false,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: '1',
      activeTour: false,
    })
  })

  it('should handle startPrinting()', () => {
    expect(app(initialState, startPrinting())).toEqual({
      readOnly: false,
      printing: true,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: null,
      activeTour: false,
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
          priorLastStreetId: null,
          activeTour: false,
        },
        stopPrinting()
      )
    ).toEqual({
      readOnly: false,
      printing: false,
      everythingLoaded: false,
      contentDirection: 'ltr',
      priorLastStreetId: null,
      activeTour: false,
    })
  })

  it('should handle everythingLoaded()', () => {
    expect(app(initialState, everythingLoaded())).toEqual({
      readOnly: false,
      printing: false,
      everythingLoaded: true,
      contentDirection: 'ltr',
      priorLastStreetId: null,
      activeTour: false,
    })
  })

  describe('should handle extra reducers', () => {
    it('should set rtl content direction on locale change', () => {
      expect(
        app(
          initialState,
          changeLocale.fulfilled({
            locale: 'ar',
          })
        )
      ).toEqual({
        readOnly: false,
        printing: false,
        everythingLoaded: false,
        contentDirection: 'rtl',
        priorLastStreetId: null,
        activeTour: false,
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
            priorLastStreetId: null,
            activeTour: false,
          },
          changeLocale.fulfilled({
            locale: 'en',
          })
        )
      ).toEqual({
        readOnly: false,
        printing: false,
        everythingLoaded: true,
        contentDirection: 'ltr',
        priorLastStreetId: null,
        activeTour: false,
      })
    })
  })
})
