/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { PaletteTrashcan } from '../PaletteTrashcan'

describe('PaletteTrashcan', () => {
  it('renders with the `-visible` class when `visible` prop is true', () => {
    const wrapper = shallow(<PaletteTrashcan visible />)
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('.palette-trashcan-visible').length).toEqual(1)
  })

  it('doesn’t render with the `show` class when `visible` prop is false', () => {
    const wrapper = shallow(<PaletteTrashcan visible={false} />)
    expect(wrapper.find('.palette-trashcan-visible').length).toEqual(0)
  })
})
