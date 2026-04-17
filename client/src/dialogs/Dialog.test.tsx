import { fireEvent, within } from '@testing-library/react'
import { render } from '~/test/helpers/render.js'
import { Dialog } from './Dialog.js'

const Contents = () => <>foo</>
const FocusableContents = () => (
  <>
    <button>First</button>
    <button>Last</button>
  </>
)
const LabeledContents = () => <h1 id="dialog-test-title">Dialog heading</h1>

describe('Dialog', () => {
  it('renders', () => {
    const { getByRole } = render(<Dialog>{() => <Contents />}</Dialog>)

    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('sets modal semantics and a focus target', () => {
    const { getByRole } = render(<Dialog>{() => <Contents />}</Dialog>)
    const dialog = getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('tabindex', '-1')
  })

  it('accepts accessible name props', () => {
    const { getByRole } = render(
      <Dialog ariaLabelledBy="dialog-test-title" ariaLabel="Fallback label">
        {() => <LabeledContents />}
      </Dialog>
    )
    const dialog = getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-test-title')
    expect(dialog).toHaveAttribute('aria-label', 'Fallback label')
  })

  it('traps focus when tabbing from the last focusable element', () => {
    const { getByRole } = render(<Dialog>{() => <FocusableContents />}</Dialog>)
    const dialog = getByRole('dialog')
    const [closeButton, firstButton, lastButton] =
      within(dialog).getAllByRole('button')

    expect(closeButton).toHaveFocus()
    firstButton.focus()
    expect(firstButton).toHaveFocus()

    lastButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(closeButton).toHaveFocus()
  })

  it('traps focus when shift-tabbing from the first focusable element', () => {
    const { getByRole } = render(<Dialog>{() => <FocusableContents />}</Dialog>)
    const dialog = getByRole('dialog')
    const buttons = within(dialog).getAllByRole('button')
    const closeButton = buttons[0]
    const lastButton = buttons[2]

    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(lastButton).toHaveFocus()
  })

  it('returns focus to the previously focused element on unmount', () => {
    const opener = document.createElement('button')
    opener.textContent = 'Open dialog'
    document.body.append(opener)
    opener.focus()

    const { unmount } = render(<Dialog>{() => <Contents />}</Dialog>)

    unmount()
    expect(opener).toHaveFocus()

    opener.remove()
  })

  // These can't be tested right now because it CSSTransition is mocked
  // and does not actually call onExited when animating out. We might
  // not be able to test this until clearDialogs() is not tied to dialog
  // animation
  it.todo('closes the dialog when the backdrop is clicked')
  it.todo('closes the dialog box when "escape" is pressed')
  it.todo('closes the dialog box when the "x" button is pressed')
})
