import reducer, {
  resetUndoStack,
  replaceUndoStack,
  createNewUndoDelta,
  undo,
  redo,
  MAX_UNDO_LIMIT,
} from './history'

describe('undo reducer', () => {
  const initialState = {
    deltaStack: [],
    deltaPosition: null,
  }

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'test' })).toEqual(initialState)
  })

  it('should handle resetUndoStack()', () => {
    expect(
      reducer(
        {
          deltaStack: [
            { forwardDelta: { a: [1] }, reverseDelta: { a: [1, 0] } },
            { forwardDelta: { b: [2] }, reverseDelta: { b: [2, 0] } },
          ],
          deltaPosition: 1,
        },
        resetUndoStack()
      )
    ).toEqual(initialState)
  })

  it('should handle replaceUndoStack()', () => {
    expect(
      reducer(
        {
          deltaStack: [],
          deltaPosition: null,
        },
        replaceUndoStack({
          deltaStack: [
            { forwardDelta: { a: [1] }, reverseDelta: { a: [1, 0] } },
            { forwardDelta: { b: [2] }, reverseDelta: { b: [2, 0] } },
          ],
          deltaPosition: 2,
        })
      )
    ).toEqual({
      deltaStack: [
        { forwardDelta: { a: [1] }, reverseDelta: { a: [1, 0] } },
        { forwardDelta: { b: [2] }, reverseDelta: { b: [2, 0] } },
      ],
      deltaPosition: 1,
    })
  })

  it('should handle createNewUndoDelta()', () => {
    const entry = {
      forwardDelta: { name: ['after'] },
      reverseDelta: { name: ['after', 'before'] },
    }

    expect(reducer(initialState, createNewUndoDelta(entry))).toEqual({
      deltaStack: [entry],
      deltaPosition: 0,
    })
  })

  it('creates a new delta entry at the top of an existing stack', () => {
    const item = {
      forwardDelta: { idx: [10] },
      reverseDelta: { idx: [10, 9] },
    }
    const state = reducer(
      {
        deltaPosition: 9,
        deltaStack: Array(10)
          .fill({})
          .map((_, i) => ({
            forwardDelta: { idx: [i] },
            reverseDelta: { idx: [i, i - 1] },
          })),
      },
      createNewUndoDelta(item)
    )

    expect(state.deltaPosition).toEqual(10)
    expect(state.deltaStack.length).toEqual(11)
    expect(state.deltaStack[state.deltaStack.length - 1]).toMatchObject(item)
  })

  it('truncates redo deltas if a new entry is created at an earlier position', () => {
    const item = {
      forwardDelta: { idx: [99] },
      reverseDelta: { idx: [99, 6] },
    }
    const state = reducer(
      {
        deltaPosition: 6,
        deltaStack: Array(10)
          .fill({})
          .map((_, i) => ({
            forwardDelta: { idx: [i] },
            reverseDelta: { idx: [i, i - 1] },
          })),
      },
      createNewUndoDelta(item)
    )

    expect(state.deltaPosition).toEqual(7)
    expect(state.deltaStack.length).toEqual(8)
    expect(state.deltaStack[state.deltaStack.length - 1]).toMatchObject(item)
  })

  it('trims delta stack that is too large', () => {
    const item = {
      forwardDelta: { idx: [999] },
      reverseDelta: { idx: [999, 98] },
    }
    const state = reducer(
      {
        deltaPosition: MAX_UNDO_LIMIT - 1,
        deltaStack: Array(MAX_UNDO_LIMIT)
          .fill({})
          .map((_, i) => ({
            forwardDelta: { idx: [i] },
            reverseDelta: { idx: [i, i - 1] },
          })),
      },
      createNewUndoDelta(item)
    )

    expect(state.deltaStack.length).toEqual(MAX_UNDO_LIMIT)
    expect(state.deltaPosition).toEqual(MAX_UNDO_LIMIT - 1)
    expect(state.deltaStack[MAX_UNDO_LIMIT - 1]).toMatchObject(item)
  })

  it('decreases delta position by 1 for undo', () => {
    const state = reducer(
      {
        deltaPosition: 9,
        deltaStack: Array(10)
          .fill({})
          .map((_, i) => ({
            forwardDelta: { idx: [i] },
            reverseDelta: { idx: [i, i - 1] },
          })),
      },
      undo()
    )

    expect(state.deltaPosition).toEqual(8)

    const state2 = reducer(state, undo())
    expect(state2.deltaPosition).toEqual(7)
  })

  it('increases delta position by 1 for redo', () => {
    const state = reducer(
      {
        deltaPosition: 2,
        deltaStack: Array(10)
          .fill({})
          .map((_, i) => ({
            forwardDelta: { idx: [i] },
            reverseDelta: { idx: [i, i - 1] },
          })),
      },
      redo()
    )

    expect(state.deltaPosition).toEqual(3)

    const state2 = reducer(state, redo())
    expect(state2.deltaPosition).toEqual(4)
  })
})
