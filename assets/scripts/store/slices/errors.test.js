/* eslint-env jest */
import errors, { showError, hideError } from './errors'

describe('errors reducer', () => {
  const initialState = {
    errorType: null,
    abortEverything: false
  }

  it('should handle initial state', () => {
    expect(errors(undefined, {})).toEqual(initialState)
  })

  it('should handle showError()', () => {
    // nothing set
    expect(errors(initialState, showError())).toEqual({
      errorType: undefined,
      abortEverything: false
    })

    // errorType explicitly set and abortEverything set to true
    expect(errors(initialState, showError('Bad URL', true))).toEqual({
      errorType: 'Bad URL',
      abortEverything: true
    })

    // errorType explicitly set and abortEverything set to false
    expect(errors(initialState, showError('Bad URL', false))).toEqual({
      errorType: 'Bad URL',
      abortEverything: false
    })

    // errorType explicitly set and abortEverything not set
    expect(errors(initialState, showError('Bad URL'))).toEqual({
      errorType: 'Bad URL',
      abortEverything: false
    })

    // NOTE: Since a null, empty or undefined value isn't provided in the tests
    // below for the abortEverything field, the field will default to true when
    // forced to boolean values.
    // TODO: Implement type-checking to ensure these cases result in a visible
    // warning and then we can remove these two test cases

    // errorType explicitly set and abortEverything set to invalid state
    expect(errors(initialState, showError('Bad URL', 'true'))).toEqual({
      errorType: 'Bad URL',
      abortEverything: true
    })

    // errorType explicitly set and abortEverything set to invalid state
    expect(errors(initialState, showError('Bad URL', -101))).toEqual({
      errorType: 'Bad URL',
      abortEverything: true
    })
  })

  it('should handle hideError()', () => {
    // nothing set
    expect(errors(initialState, hideError())).toEqual({
      errorType: null,
      abortEverything: false
    })

    // Non-default state set
    expect(
      errors(
        {
          errorType: 'Bad URL',
          abortEverything: true
        },
        hideError()
      )
    ).toEqual({
      errorType: null,
      abortEverything: false
    })
  })
})
