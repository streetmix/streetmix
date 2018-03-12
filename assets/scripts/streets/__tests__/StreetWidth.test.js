/* eslint-env jest */
import React from 'react'
import StreetWidth from '../StreetWidth'
import { shallow, mount } from 'enzyme'

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/routing', () => {})
jest.mock('../../preinit/system_capabilities', () => {})
jest.mock('../../preinit/app_settings', () => {})
jest.mock('../../app/initialization', () => {})

describe('StreetWidth', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <StreetWidth.WrappedComponent street={{}} />
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('does not allow street width to be edited if in read only mode', () => {
    const wrapper = mount(<StreetWidth.WrappedComponent street={{}} readOnly />)

    const streetWidthMenu = wrapper.find('.street-width-read')
    streetWidthMenu.simulate('click')
    const body = window.document.body
    expect(body.classList.contains('edit-street-width')).toEqual(false)
  })
})
