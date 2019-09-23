/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DebugInfo } from '../DebugInfo'

describe('DebugInfo', () => {
  it('render correctly', () => {
    const settings = { }
    const street = { }
    const flags = { }
    const undo = { }
    const user = { }
    const wrapper = shallow(<DebugInfo settings={settings} street={street} flags={flags} undo={undo} user={user} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('is visible when state visible is set', () => {
    const settings = { }
    const street = { }
    const flags = { }
    const undo = { }
    const user = { }
    const wrapper = shallow(<DebugInfo settings={settings} street={street} flags={flags} undo={undo} user={user} />)
    wrapper.setState({ visible: true })
    expect(wrapper).toMatchSnapshot()
  })
})
