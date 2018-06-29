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
    expect(reducer(undefined, actions.showError())).
      toEqual({...initialState, errorType: undefined, abortEverything: false})

    // errorType explicitly set and abortEverything set to true
    expect(reducer(undefined, actions.showError("Bad URL", true))).
      toEqual({...initialState, errorType: "Bad URL", abortEverything: true})

    // errorType explicitly set and abortEverything set to false
    expect(reducer(undefined, actions.showError("Bad URL", false))).
      toEqual({...initialState, errorType: "Bad URL", abortEverything: false})

    // errorType explicitly set and abortEverything not set
    expect(reducer(undefined, actions.showError("Bad URL"))).
      toEqual({...initialState, errorType: "Bad URL", abortEverything: false})

    // errorType explicitly set and abortEverything set to invalid state
    // FIXME: This shouldn't pass because abortEverything should always be a boolean
    expect(reducer(undefined, actions.showError("Bad URL", 'true'))).
      toEqual({...initialState, errorType: "Bad URL", abortEverything: 'true'})

    // errorType explicitly set and abortEverything set to invalid state
    // FIXME: This shouldn't pass because abortEverything should always be a boolean
    expect(reducer(undefined, actions.showError("Bad URL", 101))).
      toEqual({...initialState, errorType: "Bad URL", abortEverything: 101})
  })

  it('should handle HIDE_ERROR', () => {
    // nothing set
    expect(reducer(undefined, actions.hideError())).toEqual(initialState);

    // Non-default state set
    expect(reducer({errorType: "Bad URL", abortEverything: true}, actions.hideError())).
      toEqual(initialState);
  });
})
