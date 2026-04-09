import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { UpDownInput } from './UpDownInput.js'

// Mock the `debounce` method so that the debounced `onUpdatedValue` callback
// will be executed immediately when called (we are not implementing the
// debounce in this test)
vi.mock('just-debounce-it', () => ({
  default: vi.fn((fn) => fn),
}))

const handleUp = vi.fn()
const handleDown = vi.fn()
const handleUpdate = vi.fn()

const defaultProps = {
  value: 5,
  minValue: 1,
  maxValue: 10,
  onClickUp: handleUp,
  onClickDown: handleDown,
  onUpdatedValue: handleUpdate,
}

describe('UpDownInput', () => {
  afterEach(() => {
    handleUp.mockClear()
    handleDown.mockClear()
    handleUpdate.mockClear()
  })

  it('behaves', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} allowAutoUpdate />)

    const inputEl = screen.getByRole<HTMLInputElement>('textbox')
    const upButton = screen.getByTestId('up')
    const downButton = screen.getByTestId('down')

    // Expect input value to be displayed
    expect(inputEl.value).toBe('5')

    // Ensure handler functions are called
    await user.click(upButton)
    expect(handleUp).toHaveBeenCalled()

    await user.click(downButton)
    expect(handleDown).toHaveBeenCalled()

    await user.type(inputEl, 'abc')
    expect(handleUpdate).toHaveBeenCalledTimes(3)
  })

  // If we don't handle nullish values, React throws a warning about
  // uncontrolled components, but that won't fail the test because the <input>
  // element has, by default, an empty string value when the value isn't
  // explicitly set. If we don't handle nullish values, we will see warnings
  // in the console log (rather than failures)
  it('renders empty string in input if the value prop is null', () => {
    render(<UpDownInput {...defaultProps} value={null} />)
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('')
  })

  it('formats values using `inputValueFormatter` and `displayValueFormatter`', async () => {
    const user = userEvent.setup()

    render(
      <UpDownInput
        {...defaultProps}
        inputValueFormatter={(value) => value.toString()}
        displayValueFormatter={(value) => `${value} bar`}
      />
    )

    // When first rendered, the display formatter is called
    const inputEl = screen.getByRole<HTMLInputElement>('textbox')
    expect(inputEl.value).toBe('5 bar')

    // User focuses the input, so the input formatter is called
    await user.click(inputEl)
    expect(inputEl.value).toBe('5')

    // User clicks outside the input, setting active element elsewhere.
    // The display formatter should now be called again
    await user.click(inputEl.parentNode as Element)
    expect(inputEl.value).toBe('5 bar')
  })

  it('handles "Enter" key as confirm action', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')

    await user.clear(inputEl)
    await user.type(inputEl, '3{enter}')

    expect(handleUpdate).toHaveBeenLastCalledWith('3')
  })

  it('handles "Escape" key to revert input', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')

    await user.clear(inputEl)
    await user.type(inputEl, '3{Escape}')

    // When this is reverted, the `handleUpdate` callback is called
    // with the original value (which has been cast to string, to match
    // the type of the value of the input element)
    expect(handleUpdate).toHaveBeenLastCalledWith('5', true)
  })

  it('renders inputs as disabled', () => {
    render(<UpDownInput {...defaultProps} disabled />)

    const inputEl = screen.getByRole('textbox')
    const upButton = screen.getByTestId('up')
    const downButton = screen.getByTestId('down')

    expect(inputEl).toBeDisabled()
    expect(upButton).toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables down button when value is the min value', () => {
    render(<UpDownInput {...defaultProps} value={1} />)

    const upButton = screen.getByTestId('up')
    const downButton = screen.getByTestId('down')

    expect(upButton).not.toBeDisabled()
    expect(downButton).toBeDisabled()
  })

  it('disables up button when value is the max value', () => {
    render(<UpDownInput {...defaultProps} value={10} />)

    const upButton = screen.getByTestId('up')
    const downButton = screen.getByTestId('down')

    expect(upButton).toBeDisabled()
    expect(downButton).not.toBeDisabled()
  })
})
