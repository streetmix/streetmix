import reducer from '../errors'
import * as actions from '../../actions/errors'

describe('errors reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      errorType: null,
      abortEverything: false
    })
  })
})
