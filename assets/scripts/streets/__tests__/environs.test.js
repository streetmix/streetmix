/* eslint-env jest */
import {
  makeCSSGradientDeclaration,
  makeCanvasGradientStopArray,
  getEnvirons,
  getAllEnvirons
} from '../environs'
import MOCK_ENVIRONS from '../__mocks__/environs.json'

jest.mock('../environs.json', () => require('../__mocks__/environs.json'))
jest.mock('../constants', () => ({ DEFAULT_ENVIRONS: 'default' }))

describe('environs helpers', () => {
  describe('makeCSSGradientDeclaration', () => {
    it('makes a CSS string', () => {
      const result = makeCSSGradientDeclaration(
        MOCK_ENVIRONS.foo.backgroundGradient
      )
      expect(result).toEqual(
        'linear-gradient(#020b1a, #3e5879, #9ba5ae, #dcb697, #fc7001, #dd723c, #ad4a28, #040308)'
      )
    })

    it('makes a CSS string with stops', () => {
      const result = makeCSSGradientDeclaration(
        MOCK_ENVIRONS.bar.backgroundGradient
      )
      expect(result).toEqual(
        'linear-gradient(#020b1a, #3e5879, #9ba5ae 40%, #dcb697, #fc7001)'
      )
    })
  })

  describe('makeCanvasGradientStopArray', () => {
    it('fills in all empty stops', () => {
      const result = makeCanvasGradientStopArray(
        MOCK_ENVIRONS.foo.backgroundGradient
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
        MOCK_ENVIRONS.bar.backgroundGradient
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

  describe('getEnvirons', () => {
    it('gets info for a single environs, with React-ready style object', () => {
      const result = getEnvirons('foo')
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

    it('returns default environs if specified environs id does not exist', () => {
      const result = getEnvirons('qux')
      expect(result.id).toEqual('default')
    })
  })

  describe('getAllEnvirons', () => {
    it('gets all environs, with React-ready style object', () => {
      const results = getAllEnvirons()
      expect(results.length).toBeGreaterThan(0)
      expect(results[results.length - 1].style).toBeDefined()
    })
  })
})
