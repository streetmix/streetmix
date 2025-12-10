import { render } from '~/test/helpers/render.js'
import BlockingError from './BlockingError.js'
import { ERRORS } from './errors.js'

function getInitialState(errorType: number | null): object {
  return {
    errors: {
      errorType,
    },
    street: {
      creatorId: 'foo',
    },
  }
}

describe('BlockingError', () => {
  it.each(Object.keys(ERRORS))('renders %s', (error) => {
    const initialState = getInitialState(ERRORS[error as keyof typeof ERRORS])
    const { asFragment } = render(<BlockingError />, {
      initialState,
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders nothing if no error provided', () => {
    const initialState = getInitialState(null)
    const { container } = render(<BlockingError />, {
      initialState,
    })
    expect(container.firstChild).toBeNull()
  })
})
