/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import UndoRedo from '../UndoRedo'
import { replaceUndoStack } from '../../store/actions/undo'

// `getRemixOnFirstEdit` is a legacy function, so for the purposes of this
// test suite it always returns `false` (aka, assume user owns the street)
jest.mock('../../streets/remix', () => ({
  getRemixOnFirstEdit: () => false
}))

describe('UndoRedo', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders two buttons', () => {
    const wrapper = renderWithReduxAndIntl(<UndoRedo />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('enables undo button when an undo stack is created', () => {
    const wrapper = renderWithReduxAndIntl(<UndoRedo />, {
      initialState: {
        undo: {
          stack: [],
          position: 0
        }
      }
    })
    const undoButton = wrapper.getByTitle('Undo')
    const redoButton = wrapper.getByTitle('Redo')

    // Initial button states are disabled
    expect(undoButton.disabled).toEqual(true)
    expect(redoButton.disabled).toEqual(true)

    // Update undo stack state, and `<UndoRedo>` should receive new props
    // This is akin to a user editing the street once
    wrapper.store.dispatch(replaceUndoStack([{ foo: 'bar' }], 1))

    // Undo button state should become enabled
    // Redo button should remain disabled
    expect(undoButton.disabled).toEqual(false)
    expect(redoButton.disabled).toEqual(true)
  })

  it('enables redo button when undo stack position is lower than the top of the stack', () => {
    const wrapper = renderWithReduxAndIntl(<UndoRedo />, {
      initialState: {
        undo: {
          stack: [
            { foo: 'bar' },
            { foo: 'baz' }
          ],
          position: 0
        }
      }
    })

    // In this scenario, redo is available, but undo is not.
    expect(wrapper.getByTitle('Undo').disabled).toEqual(true)
    expect(wrapper.getByTitle('Redo').disabled).toEqual(false)
  })
})
