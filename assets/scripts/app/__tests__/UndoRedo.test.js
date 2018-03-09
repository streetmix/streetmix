/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UndoRedo } from '../UndoRedo'
import { isUndoAvailable, isRedoAvailable } from '../../streets/undo_stack'

jest.mock('../../streets/undo_stack')

describe('UndoRedo', () => {
  it('renders two buttons', () => {
    const wrapper = shallow(<UndoRedo locale={{}} />)
    expect(wrapper.find('button').length).toEqual(2)
  })

  it('checks if undo or redo is available when undo position changes', () => {
    // `<UndoRedo>` is mounted with initial props
    const wrapper = shallow(<UndoRedo undo={{ position: 0, stack: [] }} />)

    // Send new props to `<UndoRedo>`
    // It doesn't really matter what we set props to.
    wrapper.setProps({
      undo: {
        position: 1,
        stack: []
      }
    })

    expect(isUndoAvailable).toBeCalled()
    expect(isRedoAvailable).toBeCalled()

    // Clear mocks for future tests
    isUndoAvailable.mockClear()
    isRedoAvailable.mockClear()
  })

  it('checks if undo or redo is available when undo stack changes', () => {
    // `<UndoRedo>` is mounted with initial props
    const wrapper = shallow(<UndoRedo undo={{ position: 0, stack: [] }} />)

    // Send new props to `<UndoRedo>`
    // It doesn't really matter what we set props to.
    wrapper.setProps({
      undo: {
        position: 0,
        stack: [{ foo: 'bar' }]
      }
    })

    expect(isUndoAvailable).toBeCalled()
    expect(isRedoAvailable).toBeCalled()

    // Clear mocks for future tests
    isUndoAvailable.mockClear()
    isRedoAvailable.mockClear()
  })

  it('renders undo button enabled', () => {
    // `<UndoRedo>` is mounted with initial props
    const wrapper = shallow(<UndoRedo undo={{ position: 0, stack: [] }} />)

    // Initial button state at mount time is disabled
    const disabled1 = wrapper.find('button').last().prop('disabled')
    expect(disabled1).toEqual(true)

    // Send new props to `<UndoRedo>`
    // It doesn't really matter what we set props to. The mock implementation
    // of `isUndoAvailable` currently only returns `true`
    wrapper.setProps({
      undo: {
        position: 1,
        stack: [{ foo: 'bar' }]
      }
    })

    // Button state should become enabled
    const disabled2 = wrapper.find('button').first().prop('disabled')
    expect(disabled2).toEqual(false)
  })

  it('renders redo button disabled', () => {
    // `<UndoRedo>` is mounted with initial props
    const wrapper = shallow(<UndoRedo undo={{ position: 0, stack: [] }} />)

    // Initial button state at mount time is disabled
    const disabled1 = wrapper.find('button').last().prop('disabled')
    expect(disabled1).toEqual(true)

    // Send new props to `<UndoRedo>`
    // It doesn't really matter what we set props to. The mock implementation
    // of `isRedoAvailable` currently only returns `false`
    wrapper.setProps({
      undo: {
        position: 0,
        stack: []
      }
    })

    // Button state should remain disabled
    const disabled2 = wrapper.find('button').last().prop('disabled')
    expect(disabled2).toEqual(true)
  })
})
