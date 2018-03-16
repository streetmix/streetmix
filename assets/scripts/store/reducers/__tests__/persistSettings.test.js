/* eslint-env jest */
import reducer from '../persistSettings'
import * as actions from '../../actions/persistSettings'

describe('persistSettings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      units: 1,
      locale: null
    })
  })

  it('should update units from initial state', () => {
    const state = reducer(undefined, actions.setUserUnits(2))
    expect(state.units).toEqual(2)
  })

  it('should parse string arguments as integers', () => {
    const state = reducer(undefined, actions.setUserUnits('2'))
    expect(state.units).toEqual(2)
  })
})
