/* eslint-env jest */
import React from 'react'
import UpDownInput from '../UpDownInput'
import { shallow } from 'enzyme'

describe('UpDownInput', () => {
  it('behaves', () => {
    const inputValueFormatter = jest.fn((value) => 'foo')
    const displayValueFormatter = jest.fn((value) => 'bar')
    const handleUp = jest.fn()
    const handleDown = jest.fn()
    const handleUpdate = jest.fn()

    const wrapper = shallow(
      <UpDownInput
        value={5}
        minValue={1}
        maxValue={10}
        inputValueFormatter={inputValueFormatter}
        displayValueFormatter={displayValueFormatter}
        onClickUp={handleUp}
        onClickDown={handleDown}
        onUpdatedValue={handleUpdate}
        inputTooltip="input"
        upTooltip="up"
        downTooltip="down"
      />
    )

    const inputEl = wrapper.find('.up-down-input-element')
    const upButton = wrapper.find('.up-down-input-increment')
    const downButton = wrapper.find('.up-down-input-decrement')

    // Ensures title text are rendered
    expect(inputEl.props().title).toEqual('input')
    expect(upButton.props().title).toEqual('up')
    expect(downButton.props().title).toEqual('down')

    // Ensure handler functions are called
    upButton.simulate('click')
    expect(handleUp).toHaveBeenCalled()

    downButton.simulate('click')
    expect(handleDown).toHaveBeenCalled()

    // Doesn't work, needs event.target
    // inputEl.simulate('change')
    // expect(handleUpdate).toHaveBeenCalled()
  })

  it.skip('renders a non-editable value in touch mode', () => {})
  it.skip('renders as disabled', () => {})
  it.skip('handles min value', () => {})
  it.skip('handles max value', () => {})
})
