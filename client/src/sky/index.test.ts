import { vi } from 'vitest'
import MOCK_SKY_DEFS from './__mocks__/skybox-defs.json'
import {
  makeCSSGradientDeclaration,
  makeCanvasGradientStopArray,
  getSkyboxDef,
  getAllSkyboxDefs
} from '.'

vi.mock(
  './skybox-defs.json',
  async () => await import('./__mocks__/skybox-defs.json')
)
vi.mock('./constants', () => ({ DEFAULT_SKYBOX: 'default' }))

describe('skybox helpers', () => {
  describe('makeCSSGradientDeclaration', () => {
    it('makes a CSS string', () => {
      const result = makeCSSGradientDeclaration(
        MOCK_SKY_DEFS.foo.backgroundGradient as Array<
          string | [string, number?]
        >
      )
      expect(result).toEqual(
        'linear-gradient(#020b1a, #3e5879, #9ba5ae, #dcb697, #fc7001, #dd723c, #ad4a28, #040308)'
      )
    })

    it('makes a CSS string with stops', () => {
      const result = makeCSSGradientDeclaration(
        MOCK_SKY_DEFS.bar.backgroundGradient as Array<
          string | [string, number?]
        >
      )
      expect(result).toEqual(
        'linear-gradient(#020b1a, #3e5879, #9ba5ae 40%, #dcb697, #fc7001)'
      )
    })
  })

  describe('makeCanvasGradientStopArray', () => {
    it('fills in all empty stops', () => {
      const result = makeCanvasGradientStopArray(
        MOCK_SKY_DEFS.foo.backgroundGradient as Array<
          string | [string, number?]
        >
      )
      expect(result).toEqual([
        ['#020b1a', 0.0],
        ['#3e5879', 0.14285714285714285],
        ['#9ba5ae', 0.2857142857142857],
        ['#dcb697', 0.42857142857142855],
        ['#fc7001', 0.5714285714285714],
        ['#dd723c', 0.7142857142857142],
        ['#ad4a28', 0.857142857142857],
        ['#040308', 1.0]
      ])
    })

    it('fills in empty stops between known stops', () => {
      const result = makeCanvasGradientStopArray(
        MOCK_SKY_DEFS.bar.backgroundGradient as Array<
          string | [string, number?]
        >
      )
      expect(result).toEqual([
        ['#020b1a', 0.0],
        ['#3e5879', 0.2],
        ['#9ba5ae', 0.4],
        ['#dcb697', 0.7],
        ['#fc7001', 1.0]
      ])
    })
  })

  describe('getSkyboxDef', () => {
    it('gets info for a single skybox, with React-ready style object', () => {
      const result = getSkyboxDef('foo')
      expect(result).toEqual({
        id: 'foo',
        name: 'Foo',
        backgroundGradient: [
          '#020b1a',
          '#3e5879',
          ['#9ba5ae'],
          ['#dcb697'],
          ['#fc7001'],
          ['#dd723c'],
          ['#ad4a28'],
          ['#040308']
        ],
        cloudOpacity: 0.85,
        iconStyle: {
          background:
            'linear-gradient(#020b1a, #3e5879, #9ba5ae, #dcb697, #fc7001, #dd723c, #ad4a28, #040308)'
        },
        style: {
          background:
            'linear-gradient(#020b1a, #3e5879, #9ba5ae, #dcb697, #fc7001, #dd723c, #ad4a28, #040308)'
        }
      })
    })

    it('returns default skybox if specified skybox id does not exist', () => {
      const result = getSkyboxDef('qux')
      expect(result.id).toEqual('default')
    })
  })

  describe('getAllSkyboxDefs', () => {
    it('gets all skyboxes, with React-ready style object', () => {
      const results = getAllSkyboxDefs()
      expect(results.length).toBeGreaterThan(0)
      expect(results[results.length - 1].style).toBeDefined()
    })
  })
})
