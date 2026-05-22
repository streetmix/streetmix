import {
  getSegmentComponentInfo,
  applySegmentInfoOverridesAndRules,
  getSegmentSprites,
} from './segment-dict.js'

describe('getSegmentComponentInfo()', () => {
  it('returns data for a segment component', () => {
    const component = getSegmentComponentInfo('lanes', 'sidewalk')
    expect(component.unknown).toBeFalsy()
  })

  it('returns placeholder data for an unknown segment component type', () => {
    const component = getSegmentComponentInfo('lanes', 'foo')
    expect(component.unknown).toBe(true)
  })

  it('returns placeholder data for an unknown component group and type', () => {
    const component = getSegmentComponentInfo('foo', 'bar')
    expect(component.unknown).toBe(true)
  })
})

describe('applySegmentInfoOverridesAndRules()', () => {
  it('returns rules and information for a segment type and variant', () => {
    const segmentRules = { minWidth: 0, maxWidth: 2 }
    const details = {
      name: 'Bar',
      nameKey: 'bar',
      rules: {
        minWidth: 1,
      },
    }

    const variantInfo = applySegmentInfoOverridesAndRules(details, segmentRules)
    expect(variantInfo).toEqual({
      name: 'Bar',
      nameKey: 'bar',
      minWidth: 1,
      maxWidth: 2,
    })
  })
})

describe('getSegmentSprites()', () => {
  it('works', () => {
    const type = 'sidewalk'
    const variant = 'normal'
    const { components } = getSegmentLookup(type, variant)
    const sprites = getSegmentSprites(components)

    expect(sprites).toBeTruthy()
    expect(sprites).toMatchSnapshot()
  })
})
