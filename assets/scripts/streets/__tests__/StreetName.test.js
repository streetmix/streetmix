/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import StreetName from '../StreetName'

describe('StreetName', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<StreetName />)
    expect(wrapper.exists()).toEqual(true)
  })

  it('renders a name', () => {
    const wrapper = shallow(<StreetName name="foo" />)
    expect(wrapper.text()).toEqual('foo')
  })

  it('truncates very long names', () => {
    const wrapper = shallow(<StreetName name="foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar" />)
    // We don't care what the actual length of string is, just that it's been truncated
    expect(wrapper.text().endsWith('…')).toEqual(true)
  })

  it('renders a placeholder if there is no name', () => {
    // Requires the react-intl test helper to retrieve the correct content of <FormattedMessage />
    const wrapper = mountWithIntl(<StreetName />)
    expect(wrapper.text()).toEqual('Unnamed St')
  })

  it.todo('shows a "Click to edit" message when mouse is hovering over it')
  it.todo('does not do that if the street name is not editable')
  it.todo('responds to an onClick handler')
})
