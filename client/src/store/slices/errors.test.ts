import errors, { showError, hideError } from './errors'

describe('errors reducer', () => {
  const initialState = {
    errorType: null,
    abortEverything: false
  }

  it('should handle showError()', () => {
    // errorType explicitly set and abortEverything set to true
    expect(errors(initialState, showError(1, true))).toEqual({
      errorType: 1,
      abortEverything: true
    })

    // errorType explicitly set and abortEverything set to false
    expect(errors(initialState, showError(1, false))).toEqual({
      errorType: 1,
      abortEverything: false
    })

    // errorType explicitly set and abortEverything not set
    expect(errors(initialState, showError(1))).toEqual({
      errorType: 1,
      abortEverything: false
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
          errorType: 1,
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
