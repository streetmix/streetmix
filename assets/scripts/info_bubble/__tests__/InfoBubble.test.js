/* eslint-env jest */
import React from 'react'
import { InfoBubble } from '../InfoBubble'
import { shallow } from 'enzyme'

jest.mock('../../streets/data_model', () => {})
jest.mock('../../segments/view')

describe('InfoBubble', () => {
  it('renders', () => {
    const segment = {}
    const street = {
      segments: [segment]
    }
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={0} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('shows description', () => {
    const street = {
      segments: []
    }
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={1} descriptionVisible />)
    expect(wrapper).toMatchSnapshot()
  })
  it('is visible', () => {
    const street = {
      segments: []
    }
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={2} visible />)
    expect(wrapper).toMatchSnapshot()
  })
  it('shows building left info bubble', () => {
    const street = {
      segments: [],
      leftBuildingVariant: 'grass'
    }
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={'left'} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('shows building right info bubble', () => {
    const street = {
      segments: [],
      rightBuildingVariant: 'grass'
    }
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={'right'} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('updates hover polygon', () => {
    const segment = {}
    const street = {
      segments: [segment]
    }
    const updateHoverPolygon = jest.fn()
    const locale = { locale: 'en' }
    const wrapper = shallow(<InfoBubble locale={locale} street={street} position={0} visible={false} updateHoverPolygon={updateHoverPolygon} />)
    wrapper.setProps({ visible: true })
    expect(updateHoverPolygon).toHaveBeenCalledTimes(1)
  })
  describe('interactions', () => {
    it('set info bubble mouse inside', () => {
      const street = {
        segments: []
      }
      const locale = { locale: 'en' }
      const setInfoBubbleMouseInside = jest.fn()
      const updateHoverPolygon = jest.fn()
      const wrapper = shallow(<InfoBubble locale={locale} street={street} position={0} visible={false} setInfoBubbleMouseInside={setInfoBubbleMouseInside} updateHoverPolygon={updateHoverPolygon} />)
      wrapper.simulate('mouseenter')
      expect(setInfoBubbleMouseInside).toHaveBeenCalledTimes(1)
      expect(setInfoBubbleMouseInside).toHaveBeenCalledWith(true)
    })
    it('does not set info bubble mouse inside', () => {
      const street = {
        segments: []
      }
      const locale = { locale: 'en' }
      const setInfoBubbleMouseInside = jest.fn()
      const updateHoverPolygon = jest.fn()
      const wrapper = shallow(<InfoBubble locale={locale} street={street} position={0} visible={false} setInfoBubbleMouseInside={setInfoBubbleMouseInside} updateHoverPolygon={updateHoverPolygon} />)
      wrapper.simulate('mouseleave')
      expect(setInfoBubbleMouseInside).toHaveBeenCalledTimes(1)
      expect(setInfoBubbleMouseInside).toHaveBeenCalledWith(false)
    })
  })
})
