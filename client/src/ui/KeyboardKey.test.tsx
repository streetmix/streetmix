import { screen } from '@testing-library/react'

import { render } from '~/test/helpers/render.js'
import { KeyboardKey } from './KeyboardKey.js'

describe('KeyboardKey', () => {
  it('renders a <kbd> element with string child', () => {
    const { asFragment } = render(<KeyboardKey>foo</KeyboardKey>)
    expect(screen.getByText('foo').title).toBe('')
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders a <kbd> element with element child', () => {
    const { asFragment } = render(
      <KeyboardKey>
        <strong>foo</strong>
      </KeyboardKey>
    )
    expect(screen.getByText('foo').title).toBe('')
    expect(asFragment()).toMatchSnapshot()
  })
})
