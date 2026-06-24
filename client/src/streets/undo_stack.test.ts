import { beforeEach, describe, expect, it, vi } from 'vitest'
import { create } from 'jsondiffpatch'

import { finishUndoOrRedo } from './undo_stack'

const {
  updateStreetDataActionMock,
  cancelSegmentResizeTransitionsMock,
  setIgnoreStreetChangesMock,
  setUpdateTimeToNowMock,
  updateEverythingMock,
  dispatchMock,
  getStateMock,
} = vi.hoisted(() => ({
  updateStreetDataActionMock: vi.fn((payload) => ({
    type: 'street/updateStreetDataAction',
    payload,
  })),
  cancelSegmentResizeTransitionsMock: vi.fn(),
  setIgnoreStreetChangesMock: vi.fn(),
  setUpdateTimeToNowMock: vi.fn(),
  updateEverythingMock: vi.fn(),
  dispatchMock: vi.fn(),
  getStateMock: vi.fn(),
}))

vi.mock('../store', () => ({
  default: {
    dispatch: dispatchMock,
    getState: getStateMock,
  },
}))

vi.mock('../store/actions/street.js', () => ({
  updateStreetDataAction: updateStreetDataActionMock,
}))

vi.mock('../segments/resizing.js', () => ({
  cancelSegmentResizeTransitions: cancelSegmentResizeTransitionsMock,
}))

vi.mock('./data_model.js', () => ({
  setIgnoreStreetChanges: setIgnoreStreetChangesMock,
  setUpdateTimeToNow: setUpdateTimeToNowMock,
  updateEverything: updateEverythingMock,
}))

describe('finishUndoOrRedo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('preserves existing warnings on restored segments', async () => {
    const differ = create()
    const previousStreet = {
      segments: [
        {
          id: '2',
          type: 'drive-lane',
          variantString: 'default',
          width: 3,
          elevation: 0,
          slope: { on: false, values: [] },
          warnings: [false, true],
        },
      ],
    }
    const currentStreet = {
      segments: [
        {
          id: '2',
          type: 'drive-lane',
          variantString: 'default',
          width: 4,
          elevation: 0,
          slope: { on: false, values: [] },
          warnings: [false],
        },
      ],
    }
    const forwardDelta = differ.diff(previousStreet, currentStreet)
    const reverseDelta = differ.diff(currentStreet, previousStreet)

    getStateMock.mockReturnValue({
      street: currentStreet,
      history: {
        position: 0,
        stack: [
          { forwardDelta: {}, reverseDelta: {} },
          { forwardDelta, reverseDelta },
        ],
      },
    })

    await finishUndoOrRedo('undo', 1)

    expect(updateStreetDataActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: [
          expect.objectContaining({
            warnings: [false, true],
          }),
        ],
      })
    )
  })

  it('uses delta stack restore path when undo context is provided', async () => {
    const differ = create()
    const previousStreet = { name: 'before' }
    const currentStreet = { name: 'after' }
    const forwardDelta = differ.diff(previousStreet, currentStreet)
    const reverseDelta = differ.diff(currentStreet, previousStreet)

    getStateMock.mockReturnValue({
      street: currentStreet,
      history: {
        position: 0,
        stack: [
          { forwardDelta: {}, reverseDelta: {} },
          { forwardDelta, reverseDelta },
        ],
      },
    })

    await finishUndoOrRedo('undo', 1)

    expect(updateStreetDataActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'before',
      })
    )
  })

  it('restores the expected street on undo using deltas', async () => {
    const differ = create()
    const previousStreet = {
      name: 'before',
      width: 900,
      boundary: { left: { variant: 'wide' }, right: { variant: 'narrow' } },
    }
    const currentStreet = {
      name: 'after',
      width: 1000,
      boundary: { left: { variant: 'narrow' }, right: { variant: 'narrow' } },
    }
    const forwardDelta = differ.diff(previousStreet, currentStreet)
    const reverseDelta = differ.diff(currentStreet, previousStreet)

    getStateMock.mockReturnValue({
      street: currentStreet,
      history: {
        position: 0,
        stack: [
          { forwardDelta: {}, reverseDelta: {} },
          { forwardDelta, reverseDelta },
        ],
      },
    })
    await finishUndoOrRedo('undo', 1)
    const deltaRestored = updateStreetDataActionMock.mock.calls.at(-1)?.[0]

    expect(deltaRestored).toEqual(previousStreet)
  })

  it('restores the expected street on redo using deltas', async () => {
    const differ = create()
    const previousStreet = {
      name: 'before',
      width: 900,
      boundary: { left: { variant: 'wide' }, right: { variant: 'narrow' } },
    }
    const currentStreet = {
      name: 'after',
      width: 1000,
      boundary: { left: { variant: 'narrow' }, right: { variant: 'narrow' } },
    }
    const forwardDelta = differ.diff(previousStreet, currentStreet)
    const reverseDelta = differ.diff(currentStreet, previousStreet)

    getStateMock.mockReturnValue({
      street: previousStreet,
      history: {
        position: 1,
        stack: [
          { forwardDelta: {}, reverseDelta: {} },
          { forwardDelta, reverseDelta },
        ],
      },
    })
    await finishUndoOrRedo('redo', 0)
    const deltaRestored = updateStreetDataActionMock.mock.calls.at(-1)?.[0]

    expect(deltaRestored).toEqual(currentStreet)
  })
})
