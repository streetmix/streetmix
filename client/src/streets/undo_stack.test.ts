import { beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('seeds missing segment warnings before restoring street data', async () => {
    getStateMock.mockReturnValue({
      history: {
        position: 0,
        stack: [
          {
            segments: [
              {
                id: '1',
                type: 'sidewalk',
                variantString: 'default',
                width: 3,
                elevation: 0,
                slope: { on: false, values: [] },
              },
            ],
          },
        ],
      },
    })

    await finishUndoOrRedo()

    expect(updateStreetDataActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: [
          expect.objectContaining({
            warnings: [false],
          }),
        ],
      })
    )
    expect(dispatchMock).toHaveBeenCalledTimes(1)
    expect(cancelSegmentResizeTransitionsMock).toHaveBeenCalledTimes(1)
    expect(setUpdateTimeToNowMock).toHaveBeenCalledTimes(1)
    expect(updateEverythingMock).toHaveBeenCalledWith(true)
    expect(setIgnoreStreetChangesMock).toHaveBeenNthCalledWith(1, true)
    expect(setIgnoreStreetChangesMock).toHaveBeenNthCalledWith(2, false)
  })

  it('preserves existing warnings on restored segments', async () => {
    getStateMock.mockReturnValue({
      history: {
        position: 0,
        stack: [
          {
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
          },
        ],
      },
    })

    await finishUndoOrRedo()

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
})
