/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import UndoRedo from '../UndoRedo'

// For the purposes of this test suite, assume user owns the street
jest.mock('../../streets/owner', () => ({
  isOwnedByCurrentUser: () => true
}))

// Note: "default" render snapshot is covered by a test on the parent
// component. This test only covers interactions on this component.
describe('UndoRedo', () => {
  it('handles clicking undo button', () => {
    const wrapper = renderWithReduxAndIntl(<UndoRedo />, {
      initialState: {
        undo: {
          stack: [{ foo: 'bar' }, { foo: 'baz' }],
          position: 1
        }
      }
    })

    // Click the undo button
    fireEvent.click(wrapper.getByTitle('Undo'))

    // Redo should now be available, but undo is not.
    expect(wrapper.getByTitle('Undo')).toBeDisabled()
    expect(wrapper.getByTitle('Redo')).toBeEnabled()
  })

  it('handles clicking redo button', () => {
    const wrapper = renderWithReduxAndIntl(<UndoRedo />, {
      initialState: {
        undo: {
          stack: [{ foo: 'bar' }, { foo: 'baz' }],
          position: 0
        }
      }
    })

    // Expect the undo position to increment when redo button is clicked
    // Click the redo button
    fireEvent.click(wrapper.getByTitle('Redo'))

    // Undo should now be available, but redo is not.
    expect(wrapper.getByTitle('Undo')).toBeEnabled()
    expect(wrapper.getByTitle('Redo')).toBeDisabled()
  })
})
