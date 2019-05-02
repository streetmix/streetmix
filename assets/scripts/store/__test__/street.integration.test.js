/* eslint-env jest */
import { createStore } from '../../../../test/helpers/store'
import { addSegment, clearSegments, incrementSegmentWidth } from '../actions/street'

// ToDo: Remove this once refactoring of redux action saveStreetToServerIfNecessary is complete
import { saveStreetToServerIfNecessary } from '../../streets/data_model'
jest.mock('../../streets/data_model', () => {
  const actual = jest.requireActual('../../streets/data_model')
  return {
    ...actual,
    saveStreetToServerIfNecessary: jest.fn()
  }
})

describe('street integration test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('#addSegment', () => {
    it('adds the new segment at the index', () => {
      const initialState = { street: { segments: [1, 2] } }
      const store = createStore(initialState)

      store.dispatch(addSegment(1, 3))

      const { street } = store.getState()
      expect(street.segments.length).toEqual(3)
      expect(street.segments[1]).toEqual(3)
    })
  })
  describe('#clearSegments', () => {
    it('clears all segments', () => {
      const initialState = { street: { segments: [1, 2] } }
      const store = createStore(initialState)

      store.dispatch(clearSegments())

      const { street } = store.getState()
      expect(street.segments.length).toEqual(0)
    })
  })
  describe('#incrementSegmentWidth', () => {
    describe('decrease segment width by 1', () => {
      it('by resolution', async () => {
        const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] } }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, true, 200))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(199)
      })
      it('by clickIncrement', async () => {
        const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] } }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, false, 200))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(199)
      })
      it('has a remaining width of 1', async () => {
        const initialState = { street: { width: 400, segments: [{ width: 200 }, { width: 200 }] } }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, true, 200))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(199)
        expect(street.occupiedWidth).toEqual(399)
        expect(street.remainingWidth).toEqual(1)
      })
    })
    describe('increase segment width by 1', () => {
      it('by resolution', async () => {
        const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] } }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, true, true, 200))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(201)
      })
      it('by clickIncrement', async () => {
        const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] } }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, true, false, 200))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(201)
      })
    })
    // ToDo: Remove this once refactoring of redux action saveStreetToServerIfNecessary is complete
    it('saves to server', async () => {
      const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] } }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, true, false, 200))

      expect(saveStreetToServerIfNecessary).toHaveBeenCalledTimes(1)
    })
  })
})
