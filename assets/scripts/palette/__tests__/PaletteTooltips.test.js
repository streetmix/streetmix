/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import PaletteTooltips from '../PaletteTooltips'

describe('PaletteTooltips', () => {
  it('renders with the `show` class when `visible` prop is true', () => {
    const wrapper = shallow(<PaletteTooltips visible />)
    expect(wrapper.find('.palette-tooltip-show').length).toEqual(1)
  })

  it('doesn’t render with the `show` class when `visible` prop is false', () => {
    const wrapper = shallow(<PaletteTooltips visible={false} />)
    expect(wrapper.find('.palette-tooltip-show').length).toEqual(0)
  })

  it('renders the label', () => {
    const wrapper = shallow(<PaletteTooltips visible label="foo" />)
    expect(wrapper.text()).toEqual('foo')
  })

  it.skip('displays in the correct location', () => {})
})
