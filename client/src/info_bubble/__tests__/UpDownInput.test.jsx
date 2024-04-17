import React from 'react'
import { vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import UpDownInput from '../UpDownInput'

// Mock the `debounce` method so that the debounced `onUpdatedValue` callback
// will be executed immediately when called (we are not implementing the
// debounce in this test)
vi.mock('just-debounce-it', () => ({
  default: vi.fn((fn) => fn)
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
  upTooltip: 'up',
  downTooltip: 'down'
}

describe('UpDownInput', () => {
  afterEach(() => {
    handleUp.mockClear()
    handleDown.mockClear()
    handleUpdate.mockClear()
  })

  it('behaves', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} allowAutoUpdate={true} />)

    const inputEl = screen.getByRole('textbox')
    const upButton = screen.getByTitle('up')
    const downButton = screen.getByTitle('down')

    // Expect input value to be displayed
    expect(inputEl.value).toBe('5')

    // Ensure handler functions are called
    await user.click(upButton)
    expect(handleUp).toHaveBeenCalled()

    await user.click(downButton)
    expect(handleDown).toHaveBeenCalled()

    await act(async () => {
      await user.type(inputEl, 'abc')
    })
    expect(handleUpdate).toHaveBeenCalledTimes(3)
  })

  // If we don't handle nullish values, React throws a warning about
  // uncontrolled components, but that won't fail the test because the <input>
  // element has, by default, an empty string value when the value isn't
  // explicitly set. If we don't handle nullish values, we will see warnings
  // in the console log (rather than failures)
  it('renders empty string in input if the value prop is null', () => {
    render(<UpDownInput {...defaultProps} value={null} />)
    expect(screen.getByRole('textbox').value).toBe('')
  })

  it('renders empty string in input if the value prop is undefined', () => {
    render(<UpDownInput {...defaultProps} value={undefined} />)
    expect(screen.getByRole('textbox').value).toBe('')
  })

  it('formats values using `inputValueFormatter` and `displayValueFormatter`', async () => {
    const user = userEvent.setup()

    render(
      <UpDownInput
        {...defaultProps}
        inputValueFormatter={(value) => value}
        displayValueFormatter={(value) => `${value} bar`}
      />
    )

    // When first rendered, the display formatter is called
    const inputEl = screen.getByRole('textbox')
    expect(inputEl.value).toBe('5 bar')

    // User clicks on the input, so the input formatter is called
    await act(async () => {
      await user.click(inputEl)
    })
    expect(inputEl.value).toBe('5')

    // User clicks outside the input, setting active element elsewhere.
    // The display formatter should now be called again
    await act(async () => {
      await user.click(inputEl.parentNode)
    })
    expect(inputEl.value).toBe('5 bar')
  })

  // Same as above, but with mouse interaction
  it('formats values when hovering over or out on the input element', async () => {
    const user = userEvent.setup()

    render(
      <UpDownInput
        {...defaultProps}
        inputValueFormatter={(value) => value}
        displayValueFormatter={(value) => `${value} bar`}
      />
    )

    // When first rendered, the display formatter is called
    const inputEl = screen.getByRole('textbox')
    expect(inputEl.value).toBe('5 bar')

    // User hovers over the input, so the input formatter is called
    // Note: the input content is also selected, but we are not testing for that
    await act(async () => {
      await user.hover(inputEl)
    })
    expect(inputEl.value).toBe('5')

    // User unhovers over the input
    // The display formatter should now be called again
    await act(async () => {
      await user.unhover(inputEl)
    })
    expect(inputEl.value).toBe('5 bar')
  })

  // Test fails (is only ever called with '5')
  it.skip('handles "Enter" key as confirm action', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')

    await act(async () => {
      await user.clear(inputEl)
      await user.type(inputEl, '3{enter}')
    })

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenLastCalledWith('3')
    })
  })

  it('handles "Escape" key to revert input', async () => {
    const user = userEvent.setup()

    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')

    await act(async () => {
      await user.clear(inputEl)
      await user.type(inputEl, '3{Escape}')
    })

    // When this is reverted, the `handleUpdate` callback is called
    // with the original value, which is a number type, rather than
    // a string type (which would be the value of the input element)
    expect(handleUpdate).toHaveBeenLastCalledWith(5)
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

  // Fixes a bug where dirty input could be remembered between different
  // types of UI interactions. This test is currently skipped.
  // TODO: up/down handlers should affect and re-render component
  it.skip('resets "dirty" input if user switches to +/- buttons', async () => {
    render(<UpDownInput {...defaultProps} />)

    const inputEl = screen.getByRole('textbox')
    const upButton = screen.getByTitle('up')

    await userEvent.clear(inputEl)
    await userEvent.type(inputEl, '6{enter}')
    await userEvent.click(upButton)
    expect(inputEl.value).toBe('7')

    // Expect value on hover to reflect new value (7), not previous "dirty"
    // value (6)
    await userEvent.hover(inputEl)
    expect(inputEl.value).toBe('7')

    // User unhovers over the input
    await userEvent.unhover(inputEl)
    expect(inputEl.value).toBe('7')
  })
})
