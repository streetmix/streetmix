/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import CloseButton from '../CloseButton'

const onClick = jest.fn()

describe('CloseButton', () => {
  it.only('should renders without crashing', () => {
    const wrapper = shallow(<CloseButton onClick={onClick} />)
    expect(wrapper.find('button .close').length).toEqual(1)
  })
})
