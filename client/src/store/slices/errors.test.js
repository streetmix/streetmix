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
