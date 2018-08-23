/* eslint-env jest */
import React from 'react'
import LocationPopup from '../LocationPopup'
import { shallow } from 'enzyme'

describe('LocationPopup', () => {
  it('does not render if a location is not provided', () => {
    const wrapper = shallow(<LocationPopup />)

    // react-leaflet's <Popup /> should not exist
    expect(wrapper.find('Popup').exists()).toBe(false)
  })

  it('renders an address label', () => {
    const wrapper = shallow(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        label="foo"
      />
    )

    expect(wrapper.find('div').first().text()).toEqual('foo')
  })

  it('renders a confirm button if location is editable', () => {
    const handleConfirm = jest.fn()
    const handleClear = jest.fn()

    const wrapper = shallow(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable
        handleConfirm={handleConfirm}
      />
    )

    // Button should exist and has the correct label
    expect(wrapper.find('FormattedMessage').props().defaultMessage).toEqual('Confirm location')

    // When button is clicked, `handleConfirm` should be called
    wrapper.find('button').simulate('click')
    expect(handleConfirm).toHaveBeenCalled()
    expect(handleClear).toHaveBeenCalledTimes(0)
  })

  it('renders a clear button if location is clearable', () => {
    const handleConfirm = jest.fn()
    const handleClear = jest.fn()

    const wrapper = shallow(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable
        isClearable
        handleClear={handleClear}
      />
    )

    // Button should exist and has the correct label
    expect(wrapper.find('FormattedMessage').props().defaultMessage).toEqual('Clear location')

    // When button is clicked, `handleClear` should be called
    wrapper.find('button').simulate('click')
    expect(handleClear).toHaveBeenCalled()
    expect(handleConfirm).toHaveBeenCalledTimes(0)
  })
})
