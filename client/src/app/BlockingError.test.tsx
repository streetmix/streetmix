import { render } from '~/test/helpers/render.js'
import { BlockingError } from './BlockingError.js'
import { ERRORS } from './errors.js'

// Mocking this prevent a frequently flaky test outcome where redux-toolkit
// tries to run `cancelAnimationFrame` internally, which is no longer defined,
// and then the test fails.
vi.mock('../store/services/api.js', async () => {
  const actual = await vi.importActual('../store/services/api.js')

  return {
    ...actual,
    useGetUserQuery: vi.fn(() => ({ data: null })),
  }
})

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
