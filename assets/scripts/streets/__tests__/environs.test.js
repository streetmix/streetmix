/* eslint-env jest */
import { makeCanvasGradientStopArray } from '../environs'

const testGradient = [
  [ '#020b1a' ],
  [ '#3e5879' ],
  [ '#9ba5ae' ],
  [ '#dcb697' ],
  [ '#fc7001' ],
  [ '#dd723c' ],
  [ '#ad4a28' ],
  [ '#040308' ]
]

const testGradient2 = [
  [ '#020b1a' ],
  [ '#3e5879' ],
  [ '#9ba5ae', 0.4 ],
  [ '#dcb697' ],
  [ '#fc7001' ]
]

describe('makeCanvasGradientStopArray', () => {
  it('fills in all empty stops', () => {
    const result = makeCanvasGradientStopArray(testGradient)
    expect(result).toEqual([
      [ '#020b1a', 0.0 ],
      [ '#3e5879', 0.14285714285714285 ],
      [ '#9ba5ae', 0.2857142857142857 ],
      [ '#dcb697', 0.42857142857142855 ],
      [ '#fc7001', 0.5714285714285714 ],
      [ '#dd723c', 0.7142857142857142 ],
      [ '#ad4a28', 0.857142857142857 ],
      [ '#040308', 1.0 ]
    ])
  })

  it('fills in empty stops between known stops', () => {
    const result = makeCanvasGradientStopArray(testGradient2)
    expect(result).toEqual([
      [ '#020b1a', 0.0 ],
      [ '#3e5879', 0.2 ],
      [ '#9ba5ae', 0.4 ],
      [ '#dcb697', 0.7 ],
      [ '#fc7001', 1.0 ]
    ])
  })
})
