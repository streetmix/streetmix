/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DebugHoverPolygon } from '../DebugHoverPolygon'

describe('DebugHoverPolygon', () => {
  it('renders if enabled', () => {
    const wrapper = shallow(<DebugHoverPolygon enabled hoverPolygon={[]} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders nothing if disabled', () => {
    const wrapper = shallow(<DebugHoverPolygon enabled={false} />)
    expect(wrapper).toMatchSnapshot()
  })
})
