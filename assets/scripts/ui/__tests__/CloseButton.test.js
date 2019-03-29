/* eslint-env jest */
import React from 'react'
import CloseButton from '../CloseButton'
import { mountWithIntl as mount } from '../../../../test/helpers/intl-enzyme-test-helper.js'

const onClick = jest.fn()

describe('CloseButton', () => {
  it('should renders without crashing', () => {
    const wrapper = mount(<CloseButton onClick={onClick} />)
    expect(wrapper.find('button').length).toEqual(1)
  })

  it('should set title attribute', () => {
    const wrapper = mount(<CloseButton
      onClick={onClick}
      title="Delete street"
    />)
    expect(wrapper.find('button').instance().getAttribute('title')).toEqual('Delete street')
  })

  it('should set className', () => {
    const wrapper = mount(<CloseButton
      onClick={onClick}
      className="hide-btn"
    />)
    expect(wrapper.find('button').hasClass('hide-btn')).toEqual(true)
  })

  it('should call onClick function when button is clicked', () => {
    const wrapper = mount(<CloseButton
      onClick={onClick}
    />)
    wrapper.find('button').simulate('click')
    expect(onClick).toBeCalled()
  })
})
