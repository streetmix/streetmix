/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import StreetMetaWidthMenu from '../StreetMetaWidthMenu'

const formatMessage = jest.fn(({ defaultMessage }) => defaultMessage)

describe('StreetMetaWidthMenu', () => {
  it('renders (metric units, default width selected)', () => {
    // This component has a ref, so mount() is required
    const wrapper = mount(
      <StreetMetaWidthMenu
        formatMessage={formatMessage}
        street={{
          units: 0,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('renders (metric units, custom width selected)', () => {
    // This component has a ref, so mount() is required
    const wrapper = mount(
      <StreetMetaWidthMenu
        formatMessage={formatMessage}
        street={{
          units: 0,
          width: 10,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('renders (imperial units, default width selected)', () => {
    // This component has a ref, so mount() is required
    const wrapper = mount(
      <StreetMetaWidthMenu
        formatMessage={formatMessage}
        street={{
          units: 1,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('calls onChange handler when selection changed', () => {
    const handleChange = jest.fn((value) => value)
    const wrapper = mount(
      <StreetMetaWidthMenu
        formatMessage={formatMessage}
        street={{
          units: 0,
          width: 40,
          occupiedWidth: 10
        }}
        editable
        onChange={handleChange}
      />
    )

    const selectWrapper = wrapper.find('select')
    selectWrapper.simulate('change')

    // Return value is a string from <option value=""> attribute
    expect(handleChange).toHaveReturnedWith('40')
  })
})
