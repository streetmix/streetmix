/* eslint-env jest */
import { getSpriteDef } from '../info'

describe('segment info', () => {
  it('gets a sprite definition with a string id', () => {
    const sprite = getSpriteDef('trees--palm-tree')

    expect(sprite).toEqual({ id: 'trees--palm-tree', offsetX: 0, offsetY: -20.25, width: 14, height: 31 })
  })

  it('overwrites sprite definition properties with an object', () => {
    const sprite = getSpriteDef({
      id: 'bikes--bike-rack-perpendicular-left',
      offsetY: 5.25
    })

    expect(sprite).toEqual({ id: 'bikes--bike-rack-perpendicular-left', width: 6, height: 6, offsetY: 5.25 })
  })
})
