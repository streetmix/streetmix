/* eslint-env jest */
import reducer from '../persistSettings'
import * as actions from '../../actions/persistSettings'

describe('persistSettings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      units: 1
    })
  })

  it('should update units from initial state', () => {
    expect(
      reducer(undefined, actions.setUserUnits(2))
    ).toEqual({
      units: 2
    })
  })
})
