import { create } from 'jsondiffpatch'

import { finishUndoOrRedo } from './undo_stack.js'

// Most of the mocks in this suite were set up by Claude, and I'm not
// that happy with it.
const {
  updateStreetDataActionMock,
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
  setIgnoreStreetChangesMock: vi.fn(),
  setUpdateTimeToNowMock: vi.fn(),
  updateEverythingMock: vi.fn(),
  dispatchMock: vi.fn(),
  getStateMock: vi.fn(),
}))

// This side effect method uses a `setTimeout`, mocking it prevents
// async leakage
vi.mock('../segments/resizing.js', () => ({
  cancelSegmentResizeTransitions: vi.fn(),
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

vi.mock('./data_model.js', () => ({
  setIgnoreStreetChanges: setIgnoreStreetChangesMock,
  setUpdateTimeToNow: setUpdateTimeToNowMock,
  updateEverything: updateEverythingMock,
}))

describe('finishUndoOrRedo', () => {
  afterEach(() => {
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
    const delta = differ.diff(previousStreet, currentStreet)

    getStateMock.mockReturnValue({
      street: currentStreet,
      history: {
        position: 0,
        stack: [{}, delta],
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

  it('restores the expected street on undo', async () => {
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
    const delta = differ.diff(previousStreet, currentStreet)

    getStateMock.mockReturnValue({
      street: currentStreet,
      history: {
        position: 0,
        stack: [{}, delta],
      },
    })
    await finishUndoOrRedo('undo', 1)
    const deltaRestored = updateStreetDataActionMock.mock.calls.at(-1)?.[0]

    expect(deltaRestored).toEqual(previousStreet)
  })

  it('restores the expected street on redo', async () => {
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
    const delta = differ.diff(previousStreet, currentStreet)

    getStateMock.mockReturnValue({
      street: previousStreet,
      history: {
        position: 1,
        stack: [{}, delta],
      },
    })
    await finishUndoOrRedo('redo', 0)
    const deltaRestored = updateStreetDataActionMock.mock.calls.at(-1)?.[0]

    expect(deltaRestored).toEqual(currentStreet)
  })
})
