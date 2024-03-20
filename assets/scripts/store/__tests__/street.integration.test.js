/* eslint-env jest */
import MockAdapter from 'axios-mock-adapter'

import { createStore } from '../../../../test/helpers/store'
import { addSegment, clearSegments } from '../slices/street'
import { incrementSegmentWidth, getLastStreet } from '../actions/street'

// ToDo: Remove this once refactoring of redux action saveStreetToServerIfNecessary is complete
import { saveStreetToServerIfNecessary } from '../../streets/data_model'

import apiClient from '../../util/api'
import { ERRORS } from '../../app/errors'

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
      it('by resolution (metric)', async () => {
        const initialState = {
          street: { segments: [{ width: 10 }, { width: 10 }], units: 0 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, true, 10))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(9.95)
      })

      it('by resolution (imperial)', async () => {
        const initialState = {
          street: { segments: [{ width: 3.048 }, { width: 3.048 }], units: 1 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, true, 3.048))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(2.972)
      })

      it('by clickIncrement', async () => {
        const initialState = {
          street: { segments: [{ width: 6.05 }, { width: 6.05 }], units: 0 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, false, 6.05))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(6)
      })

      it('has a remaining width of 0.05', async () => {
        const initialState = {
          street: {
            width: 24,
            segments: [{ width: 12 }, { width: 12 }],
            units: 0
          }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, false, true, 12))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(11.95)
        expect(street.occupiedWidth).toEqual(23.95)
        expect(street.remainingWidth).toEqual(0.05)
      })

      it('handles decrementing an imprecise value to nearest precise value', async () => {
        const initialState = {
          street: { segments: [{ width: 2.123 }], units: 0 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(0, false, false, 2.123))

        const { street } = store.getState()
        expect(street.segments[0].width).toEqual(2.1)
      })
    })

    describe('increase segment width by 1', () => {
      it('by resolution', async () => {
        const initialState = {
          street: { segments: [{ width: 5 }, { width: 5 }], units: 0 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, true, true, 5))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(5.05)
      })

      it('by clickIncrement', async () => {
        const initialState = {
          street: { segments: [{ width: 3.658 }, { width: 3.658 }], units: 1 }
        }
        const store = createStore(initialState)

        await store.dispatch(incrementSegmentWidth(1, true, false, 3.658))

        const { street } = store.getState()
        expect(street.segments[1].width).toEqual(3.81)
      })
    })

    // ToDo: Remove this once refactoring of redux action saveStreetToServerIfNecessary is complete
    it('saves to server', async () => {
      const initialState = {
        street: { segments: [{ width: 200 }, { width: 200 }] }
      }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(1, true, false, 200))

      expect(saveStreetToServerIfNecessary).toHaveBeenCalledTimes(1)
    })

    it('handles incrementing an imprecise value to nearest precise value', async () => {
      const initialState = {
        street: { segments: [{ width: 2.147 }], units: 0 }
      }
      const store = createStore(initialState)

      await store.dispatch(incrementSegmentWidth(0, true, false, 2.147))

      const { street } = store.getState()
      expect(street.segments[0].width).toEqual(2.15)
    })
  })

  describe('#getLastStreet', () => {
    let apiMock
    const type = 'streetcar'
    const variantString = 'inbound|regular'
    const segment = { variantString, id: '1', width: 400, type }
    const street = {
      segments: [segment],
      width: 100
    }
    const apiResponse = {
      id: '3',
      originalStreetId: '1',
      updatedAt: '',
      name: 'StreetName',
      data: {
        street
      }
    }

    beforeEach(() => {
      apiMock = new MockAdapter(apiClient.client)
    })

    afterEach(() => {
      apiMock.restore()
    })

    it('updates the street', async () => {
      const store = createStore({ app: { priorLastStreetId: '1' } })

      apiMock.onAny().reply(200, apiResponse)
      await store.dispatch(getLastStreet())

      const { street } = store.getState()
      expect(street.segments.length).toEqual(1)
    })

    it('sets lastStreetId', async () => {
      const store = createStore({ app: { priorLastStreetId: '1' } })

      apiMock.onAny().reply(200, apiResponse)
      await store.dispatch(getLastStreet())

      const { settings } = store.getState()
      expect(settings.lastStreetId).toEqual('3')
    })

    it('sets lastStreetId', async () => {
      const store = createStore({
        street: { id: '50', namespaceId: '45' },
        app: { priorLastStreetId: '1' }
      })

      apiMock.onAny().reply(200, apiResponse)
      await store.dispatch(getLastStreet())

      const { street } = store.getState()
      expect(street.id).toEqual('50')
      expect(street.namespaceId).toEqual('45')
    })

    describe('response failure', () => {
      it('does not set lastStreetId', async () => {
        const store = createStore({ app: { priorLastStreetId: '1' } })

        apiMock.onAny().networkError()
        await store.dispatch(getLastStreet())

        const { errors } = store.getState()
        expect(errors.errorType).toEqual(ERRORS.NEW_STREET_SERVER_FAILURE)
      })
    })
  })
})
