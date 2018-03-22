/* eslint-env jest */
import React from 'react'
import { StreetMetaWidth } from '../StreetMetaWidth'
import { shallowWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/routing', () => {})
jest.mock('../../preinit/system_capabilities', () => {})
jest.mock('../../preinit/app_settings', () => {})
jest.mock('../../app/initialization', () => {})

describe('StreetMetaWidth', () => {
  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(
      <StreetMetaWidth street={{}} />
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('does not allow street width to be edited if in read only mode', () => {
    const wrapper = shallowWithIntl(<StreetMetaWidth street={{}} readOnly />)

    const streetWidthMenu = wrapper.find('.street-width-read')
    streetWidthMenu.simulate('click')
    const body = window.document.body
    expect(body.classList.contains('edit-street-width')).toEqual(false)
  })
})
