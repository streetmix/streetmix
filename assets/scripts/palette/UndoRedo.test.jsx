import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../test/helpers/render'
import UndoRedo from './UndoRedo'

// For the purposes of this test suite, assume user owns the street
vi.mock('../streets/owner', () => ({
  isOwnedByCurrentUser: () => true
}))

// Note: "default" render snapshot is covered by a test on the parent
// component. This test only covers interactions on this component.
describe('UndoRedo', () => {
  it('handles clicking undo button', async () => {
    render(<UndoRedo />, {
      initialState: {
        history: {
          stack: [{ foo: 'bar' }, { foo: 'baz' }],
          position: 1
        }
      }
    })

    // Click the undo button
    await userEvent.click(screen.getByTitle('Undo'))

    // Redo should now be available, but undo is not.
    expect(screen.getByTitle('Undo')).toBeDisabled()
    expect(screen.getByTitle('Redo')).toBeEnabled()
  })

  it('handles clicking redo button', async () => {
    render(<UndoRedo />, {
      initialState: {
        history: {
          stack: [{ foo: 'bar' }, { foo: 'baz' }],
          position: 0
        }
      }
    })

    // Expect the undo position to increment when redo button is clicked
    // Click the redo button
    await userEvent.click(screen.getByTitle('Redo'))

    // Undo should now be available, but redo is not.
    expect(screen.getByTitle('Undo')).toBeEnabled()
    expect(screen.getByTitle('Redo')).toBeDisabled()
  })
})
