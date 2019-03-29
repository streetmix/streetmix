/* eslint-env jest */
import React from 'react'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { StreetMetaWidthWithIntl as StreetMetaWidth } from '../StreetMetaWidth'

jest.mock('../../app/load_resources', () => {})
jest.mock('../../preinit/app_settings', () => {})
jest.mock('../../app/initialization', () => {})

describe('StreetMetaWidth', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <StreetMetaWidth street={{}} />
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('does not allow street width to be edited if in read only mode', () => {
    const wrapper = shallow(<StreetMetaWidth street={{}} editable={false} />)

    const streetWidthMenu = wrapper.find('.street-width')
    streetWidthMenu.simulate('click')

    expect(wrapper.state().isEditing).toEqual(false)
  })
})
