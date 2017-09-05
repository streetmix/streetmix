/* eslint-env jest */
import reducer, { MAX_UNDO_LIMIT } from '../undo'
import * as actions from '../../actions/undo'

describe('undo reducer', () => {
  it('creates a new undo', () => {
    expect(reducer(undefined, actions.createNewUndo({ foo: 'bar' })))
      .toMatchObject({
        position: 0,
        stack: [
          { foo: 'bar' }
        ]
      })
  })

  it('creates a new undo at the top of an existing stack', () => {
    const item = { foo: 'bar' }
    const state = reducer({
      position: 9,
      stack: Array(10).fill({})
    }, actions.createNewUndo(item))

    expect(state.position).toEqual(10)
    expect(state.stack.length).toEqual(11)
    expect(state.stack[state.stack.length - 1]).toMatchObject(item)
  })

  it('truncates an undo stack if a new undo state is created at an earlier position', () => {
    const item = { foo: 'bar' }
    const state = reducer({
      position: 6,
      stack: Array(10).fill({})
    }, actions.createNewUndo(item))

    // Expect the position to have increased by 1
    expect(state.position).toEqual(7)

    // Expect the stack to be truncated
    expect(state.stack.length).toEqual(8)

    // Expect the last item on the stack to match what was added
    expect(state.stack[state.position]).toMatchObject(item)
  })

  it('trims an undo stack that is too large', () => {
    const MAX_UNDO_POSITION = MAX_UNDO_LIMIT - 1 // Position is zero-index
    const item = { foo: 'bar' }
    const state = reducer({
      position: MAX_UNDO_POSITION,
      stack: [{ foo: 'baz' }, ...Array(MAX_UNDO_POSITION).fill({})]
    }, actions.createNewUndo(item))

    // Stack size should max at MAX_UNDO_LIMIT
    expect(state.stack.length).toEqual(MAX_UNDO_LIMIT)

    // Position should max at MAX_UNDO_POSITION
    expect(state.position).toEqual(MAX_UNDO_POSITION)

    // Expect the last item on the stack to match what was added
    expect(state.stack[MAX_UNDO_POSITION]).toMatchObject(item)

    // Expect the first item on the stack to be trimmed out of existence
    expect(state.stack[0]).toMatchObject({})
  })

  it('decreases position by 1 for undo', () => {
    const state = reducer({
      position: 9,
      stack: Array(10).fill({}).map((x, i) => ({ id: i }))
    }, actions.undoAction({ id: 1000 }))

    expect(state.position).toEqual(8)
    expect(state.stack[9]).toMatchObject({ id: 1000 })

    // One more
    const state2 = reducer(state, actions.undoAction({ id: 1001 }))
    expect(state2.position).toEqual(7)
    expect(state2.stack[8]).toMatchObject({ id: 1001 })
  })

  it('increases position by 1 for redo', () => {
    const state = reducer({
      position: 2,
      stack: Array(10).fill({}).map((x, i) => ({ id: i }))
    }, actions.redoAction())

    expect(state.position).toEqual(3)

    // One more
    const state2 = reducer(state, actions.redoAction())
    expect(state2.position).toEqual(4)
  })

  it('unifies metadata on an undo stack', () => {
    const item = {
      id: 1,
      name: 'foo',
      namespacedId: 2,
      creatorId: 3,
      updatedAt: 'bar'
    }
    const state = reducer({
      stack: Array(10).fill({
        id: 0,
        name: 'bar',
        namespacedId: 1,
        creatorId: 2,
        updatedAt: 'baz'
      })
    }, actions.unifyStack(item))

    // Expect everything in the stack to match the desired item
    expect(state.stack).toMatchObject(Array(10).fill(item))
  })
})
