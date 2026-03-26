import { render } from '~/test/helpers/render.js'
import { SignInDialog } from './SignInDialog.js'

describe('SignInDialog', () => {
  it('renders', () => {
    const { asFragment } = render(<SignInDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
