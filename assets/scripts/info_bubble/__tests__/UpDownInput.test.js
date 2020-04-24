/* eslint-env jest */
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import UpDownInput from '../UpDownInput'

const inputValueFormatter = jest.fn((value) => value)
const displayValueFormatter = jest.fn((value) => value)
const handleUp = jest.fn()
const handleDown = jest.fn()
const handleUpdate = jest.fn()

const defaultProps = {
  value: 5,
  minValue: 1,
  maxValue: 10,
  inputValueFormatter: inputValueFormatter,
  displayValueFormatter: displayValueFormatter,
  onClickUp: handleUp,
  onClickDown: handleDown,
  onUpdatedValue: handleUpdate,
  inputTooltip: 'input',
  upTooltip: 'up',
  downTooltip: 'down'
}

describe('UpDownInput', () => {
  afterEach(() => {
    handleUp.mockClear()
    handleDown.mockClear()
    handleUpdate.mockClear()
  })

  it('behaves', () => {
    const wrapper = render(<UpDownInput {...defaultProps} />)

    // const inputEl = wrapper.getByTitle('input')
    const upButton = wrapper.getByTitle('up')
    const downButton = wrapper.getByTitle('down')

    // Ensure handler functions are called
    fireEvent.click(upButton)
    expect(handleUp).toHaveBeenCalled()

    fireEvent.click(downButton)
    expect(handleDown).toHaveBeenCalled()

    // TODO: This is not being called
    // fireEvent.keyDown(inputEl, { key: 'A' })
    // expect(handleUpdate).toHaveBeenCalled()
  })

  it('renders inputs as disabled', () => {
    const wrapper = render(<UpDownInput {...defaultProps} disabled />)

    const inputEl = wrapper.getByTitle('input')
    const upButton = wrapper.getByTitle('up')
    const downButton = wrapper.getByTitle('down')

    expect(inputEl).toBeDisabled()
    expect(upButton).toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables down button when value is the min value', () => {
    const wrapper = render(<UpDownInput {...defaultProps} value={1} />)

    const upButton = wrapper.getByTitle('up')
    const downButton = wrapper.getByTitle('down')

    expect(upButton).not.toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables up button when value is the max value', () => {
    const wrapper = render(<UpDownInput {...defaultProps} value={10} />)

    const upButton = wrapper.getByTitle('up')
    const downButton = wrapper.getByTitle('down')

    expect(upButton).toBeDisabled()
    expect(downButton).not.toBeDisabled()
  })
})
