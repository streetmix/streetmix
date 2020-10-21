/* eslint-env jest */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpDownInput from '../UpDownInput'

// Mock out lodash's `debounce` method so that the debounced
// `onUpdatedValue` callback will be executed immediately when
// called (we are not implementing the debounce in this test)
jest.mock('lodash', () => ({
  debounce: (fn) => fn
}))

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
    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')
    const upButton = screen.getByTitle('up')
    const downButton = screen.getByTitle('down')

    // Ensure handler functions are called
    userEvent.click(upButton)
    expect(handleUp).toHaveBeenCalled()

    userEvent.click(downButton)
    expect(handleDown).toHaveBeenCalled()

    userEvent.type(inputEl, 'abc')
    expect(handleUpdate).toHaveBeenCalledTimes(3)
  })

  it('renders inputs as disabled', () => {
    render(<UpDownInput {...defaultProps} disabled={true} />)

    const inputEl = screen.getByRole('textbox')
    const upButton = screen.getByTitle('up')
    const downButton = screen.getByTitle('down')

    expect(inputEl).toBeDisabled()
    expect(upButton).toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables down button when value is the min value', () => {
    render(<UpDownInput {...defaultProps} value={1} />)

    const upButton = screen.getByTitle('up')
    const downButton = screen.getByTitle('down')

    expect(upButton).not.toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables up button when value is the max value', () => {
    render(<UpDownInput {...defaultProps} value={10} />)

    const upButton = screen.getByTitle('up')
    const downButton = screen.getByTitle('down')

    expect(upButton).toBeDisabled()
    expect(downButton).not.toBeDisabled()
  })
})
