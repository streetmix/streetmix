/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UndoRedo } from '../UndoRedo'

jest.mock('../../streets/undo_stack', () => {
  return {
    undo: () => {},
    redo: () => {},
    isUndoAvailable: jest.fn(() => true),
    isRedoAvailable: jest.fn(() => false)
  }
})

describe('UndoRedo', () => {
  it('renders two buttons', () => {
    const wrapper = shallow(<UndoRedo />)
    expect(wrapper.find('button').length).toEqual(2)
  })

  it('checks if redo or undo is available when undo position changes', () => {
    UndoRedo.prototype.componentWillReceiveProps = jest.fn()
    const wrapper = shallow(<UndoRedo />)
    wrapper.setProps({
      undo: {
        position: 1,
        stack: []
      }
    })
    expect(UndoRedo.prototype.componentWillReceiveProps).toBeCalled()
    UndoRedo.prototype.componentWillReceiveProps.mockClear()
  })

  it('checks if redo or undo is available when undo stack changes', () => {
    UndoRedo.prototype.componentWillReceiveProps = jest.fn()
    const wrapper = shallow(<UndoRedo />)
    wrapper.setProps({
      undo: {
        position: 0,
        stack: [{ foo: 'bar' }]
      }
    })
    expect(UndoRedo.prototype.componentWillReceiveProps).toBeCalled()
    UndoRedo.prototype.componentWillReceiveProps.mockClear()
  })

  it('renders undo button enabled', () => {
    const wrapper = shallow(<UndoRedo />)
    wrapper.setProps({
      undo: {
        position: 1,
        stack: [{ foo: 'bar' }]
      }
    })
    const disabled = wrapper.find('button').first().prop('disabled')
    expect(disabled).toEqual(false)
  })

  it('renders redo button disabled', () => {
    const wrapper = shallow(<UndoRedo />)
    wrapper.setProps({
      undo: {
        position: 0,
        stack: []
      }
    })
    const disabled = wrapper.find('button').last().prop('disabled')
    expect(disabled).toEqual(true)
  })
})
