import { percentToNumber, round } from './number.js'

describe('percentToNumber()', () => {
  it('converts a number% string', () => {
    const result = percentToNumber('65%')
    expect(result).toEqual(0.65)
  })

  it('converts a number% string over 100%', () => {
    const result = percentToNumber('125%')
    expect(result).toEqual(1.25)
  })

  it('converts a number without % symbol', () => {
    const result = percentToNumber('80')
    expect(result).toEqual(0.8)
  })
})

describe('round()', () => {
  // Example of test case that fails in Math.round() or Number.toFixed()
  it('rounds 0.005 to 2 decimals', () => {
    const result = round(1.005, 2)
    expect(result).toEqual(1.01)
  })

  it('rounds 2.1 down', () => {
    const result = round(2.1)
    expect(result).toEqual(2)
  })

  it('rounds 2.5 up', () => {
    const result = round(2.5)
    expect(result).toEqual(3)
  })

  it('rounds 2.9 up', () => {
    const result = round(2.9)
    expect(result).toEqual(3)
  })
})
