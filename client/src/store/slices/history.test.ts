import reducer, {
  resetUndoStack,
  replaceUndoStack,
  createNewUndo,
  unifyStack,
  undo,
  redo,
  MAX_UNDO_LIMIT,
} from './history'

describe('undo reducer', () => {
  const initialState = {
    stack: [],
    position: null,
  }

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'test' })).toEqual(initialState)
  })

  it('should handle resetUndoStack()', () => {
    expect(
      reducer(
        {
          stack: [{}, {}, {}],
          position: 1,
        },
        resetUndoStack()
      )
    ).toEqual(initialState)
  })

  it('should handle replaceUndoStack()', () => {
    expect(
      reducer(
        {
          stack: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
          position: 2,
        },
        replaceUndoStack({
          stack: [{ name: 'd' }, { name: 'e' }],
          position: 2,
        })
      )
    ).toEqual({
      stack: [{ name: 'd' }, { name: 'e' }],
      // Stack position must actually be within length of new stack
      position: 1,
    })
  })

  it('should handle createNewUndo()', () => {
    expect(reducer(initialState, createNewUndo({ name: 'bar' }))).toEqual({
      position: 0,
      stack: [{ name: 'bar' }],
    })
  })

  it('creates a new undo at the top of an existing stack', () => {
    const item = { name: 'bar' }
    const state = reducer(
      {
        position: 9,
        stack: Array(10).fill({}),
      },
      createNewUndo(item)
    )

    expect(state.position).toEqual(10)
    expect(state.stack.length).toEqual(11)
    expect(state.stack[state.stack.length - 1]).toMatchObject(item)
  })

  it('truncates an undo stack if a new undo state is created at an earlier position', () => {
    const item = { name: 'bar' }
    const state = reducer(
      {
        position: 6,
        stack: Array(10).fill({}),
      },
      createNewUndo(item)
    )

    // Expect the position to point to the newly added item
    expect(state.position).toEqual(7)

    // Expect the stack to be truncated and then appended by one item
    expect(state.stack.length).toEqual(8)

    // Expect the last item on the stack to match what was added
    expect(state.stack[state.stack.length - 1]).toMatchObject(item)
  })

  it('trims an undo stack that is too large', () => {
    const item = { name: 'bar' }
    const state = reducer(
      {
        position: MAX_UNDO_LIMIT - 1,
        stack: [{ name: 'baz' }, ...Array(MAX_UNDO_LIMIT - 1).fill({})],
      },
      createNewUndo(item)
    )

    // Stack size should max at MAX_UNDO_LIMIT
    expect(state.stack.length).toEqual(MAX_UNDO_LIMIT)

    // Position should point to the final item in the stack
    expect(state.position).toEqual(MAX_UNDO_LIMIT - 1)

    // Expect the last item on the stack to match what was added
    expect(state.stack[MAX_UNDO_LIMIT - 1]).toMatchObject(item)

    // Expect the first item on the stack to be trimmed out of existence
    expect(state.stack[0]).toMatchObject({})
  })

  it('decreases position by 1 for undo', () => {
    const state = reducer(
      {
        position: 9,
        stack: Array(10)
          .fill({})
          .map((x, i) => ({ id: `${i}` })),
      },
      undo()
    )

    expect(state.position).toEqual(8)
    expect(state.stack[9]).toMatchObject({ id: '9' })

    // One more
    const state2 = reducer(state, undo())
    expect(state2.position).toEqual(7)
    expect(state2.stack[8]).toMatchObject({ id: '8' })
  })

  it('increases position by 1 for redo', () => {
    const state = reducer(
      {
        position: 2,
        stack: Array(10)
          .fill({})
          .map((x, i) => ({ id: `${i}` })),
      },
      redo()
    )

    expect(state.position).toEqual(3)

    // One more
    const state2 = reducer(state, redo())
    expect(state2.position).toEqual(4)
  })

  it('unifies metadata on an undo stack', () => {
    const item = {
      id: '1',
      name: 'foo',
      namespacedId: 2,
      creatorId: '3',
      updatedAt: 'bar',
    }
    const state = reducer(
      {
        position: 0,
        stack: Array(10).fill({
          id: '0',
          name: 'bar',
          namespacedId: 1,
          creatorId: '2',
          updatedAt: 'baz',
        }),
      },
      unifyStack(item)
    )

    // Expect everything in the stack to match the desired item
    expect(state.stack).toMatchObject(Array(10).fill(item))
  })
})
