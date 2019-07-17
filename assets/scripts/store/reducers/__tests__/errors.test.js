/* eslint-env jest */
import reducer from '../errors'
import * as actions from '../../actions/errors'

const initialState = {
  errorType: null,
  abortEverything: false
}

describe('errors reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should handle SHOW_ERROR', () => {
    // nothing set
    expect(reducer(undefined, actions.showError()))
      .toEqual({ ...initialState, errorType: undefined, abortEverything: false })

    // errorType explicitly set and abortEverything set to true
    expect(reducer(undefined, actions.showError('Bad URL', true)))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: true })

    // errorType explicitly set and abortEverything set to false
    expect(reducer(undefined, actions.showError('Bad URL', false)))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: false })

    // errorType explicitly set and abortEverything not set
    expect(reducer(undefined, actions.showError('Bad URL')))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: false })

    // NOTE: Since a null, empty or undefined value isn't provided in the tests
    // below for the abortEverything field, the field will default to true when
    // forced to boolean values.
    // TODO: Implement type-checking to ensure these cases result in a visible
    // warning and then we can remove these two test cases

    // errorType explicitly set and abortEverything set to invalid state
    expect(reducer(undefined, actions.showError('Bad URL', 'true')))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: true })

    // errorType explicitly set and abortEverything set to invalid state
    expect(reducer(undefined, actions.showError('Bad URL', -101)))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: true })
  })

  it('should handle HIDE_ERROR', () => {
    // nothing set
    expect(reducer(undefined, actions.hideError())).toEqual(initialState)

    // Non-default state set
    expect(reducer({ errorType: 'Bad URL', abortEverything: true }, actions.hideError()))
      .toEqual(initialState)
  })

  it('should handle an invalid action', () => {
    // Nothing set
    expect(reducer(undefined, 'invalid action')).toEqual(initialState)

    // Non-default state
    expect(reducer({ errorType: 'Bad URL', abortEverything: true }, 'invalid action'))
      .toEqual({ ...initialState, errorType: 'Bad URL', abortEverything: true })
  })
})
