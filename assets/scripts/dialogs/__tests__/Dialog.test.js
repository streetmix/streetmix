/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import Dialog from '../Dialog'

const Contents = () => <>foo</>

describe('Dialog', () => {
  it('renders', () => {
    const { getByRole } = render(
      <Dialog>{(closeDialog) => <Contents />}</Dialog>
    )

    expect(getByRole('dialog')).toBeInTheDocument()
  })

  // These can't be tested right now because it CSSTransition is mocked
  // and does not actually call onExited when animating out. We might
  // not be able to test this until clearDialogs() is not tied to dialog
  // animation
  it.todo('closes the dialog when the backdrop is clicked')
  it.todo('closes the dialog box when "escape" is pressed')
  it.todo('closes the dialog box when the "x" button is pressed')
})
