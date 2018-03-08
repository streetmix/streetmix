/* eslint-env jest */
import {
  getSpriteDef,
  getAllSegmentInfo,
  getSegmentInfo,
  getSegmentVariantInfo
} from '../info'

describe('segment info', () => {
  it('gets a sprite definition with a string id', () => {
    const sprite = getSpriteDef('trees--palm-tree')

    expect(sprite).toEqual({ id: 'trees--palm-tree', offsetX: 0, offsetY: -20.25, width: 14 })
  })

  it('overwrites sprite definition properties with an object', () => {
    const sprite = getSpriteDef({
      id: 'bikes--bike-rack-perpendicular-left',
      offsetY: 5.25
    })

    expect(sprite).toEqual({ id: 'bikes--bike-rack-perpendicular-left', width: 6, offsetY: 5.25 })
  })

  describe('getAllSegmentInfo()', () => {
    it('returns all segment data', () => {
      const segments = getAllSegmentInfo()
      expect(segments['sidewalk'].name).toEqual('Sidewalk')
    })
  })

  describe('getSegmentInfo()', () => {
    it('returns data for a segment type', () => {
      const segment = getSegmentInfo('sidewalk')
      expect(segment.name).toEqual('Sidewalk')
    })

    it('returns placeholder data for an unknown segment type', () => {
      const segment = getSegmentInfo('foo')
      expect(segment.name).toEqual('Unknown')
    })
  })

  describe('getSegmentVariantInfo()', () => {
    it('returns data for a segment variant', () => {
      const variant = getSegmentVariantInfo('sidewalk', 'normal')
      expect(variant).toEqual({
        minWidth: 6,
        graphics: {
          repeat: 'ground--concrete'
        }
      })
    })

    const unknownVariant = {
      name: 'Unknown',
      graphics: {
        center: 'missing'
      }
    }

    it('returns placeholder data for an unknown variant', () => {
      const variant = getSegmentVariantInfo('sidewalk', 'foo')
      expect(variant).toEqual(unknownVariant)
    })

    it('returns placeholder data for an unknown segment type and variant', () => {
      const variant = getSegmentVariantInfo('foo', 'bar')
      expect(variant).toEqual(unknownVariant)
    })
  })
})
