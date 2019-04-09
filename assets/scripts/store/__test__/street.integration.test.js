/* eslint-env jest */
import { createStore } from '../../../../test/helpers/store'
import { addSegment, clearSegments, incrementSegmentWidth } from '../actions/street'

describe('street integration test', () => {
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
    it('increment by resolution', async () => {
      const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] }, ui: { unitSettings: { resolution: 1 } } }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, true, true, 200))

      const { street } = store.getState()
      expect(street.segments[1].width).toEqual(201)
    })
    it('decrease by resolution', async () => {
      const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] }, ui: { unitSettings: { resolution: 1 } } }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, false, true, 200))

      const { street } = store.getState()
      expect(street.segments[1].width).toEqual(199)
    })
    it('increase by clickIncrement', async () => {
      const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] }, ui: { unitSettings: { clickIncrement: 1 } } }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, true, false, 200))

      const { street } = store.getState()
      expect(street.segments[1].width).toEqual(201)
    })
    it('decrease by clickIncrement', async () => {
      const initialState = { street: { segments: [{ width: 200 }, { width: 200 }] }, ui: { unitSettings: { clickIncrement: 1 } } }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, false, false, 200))

      const { street } = store.getState()
      expect(street.segments[1].width).toEqual(199)
    })
  })
})
