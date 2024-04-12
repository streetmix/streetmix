import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../test/helpers/render'
import KeyboardKey from './KeyboardKey'

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

  it('renders a <kbd> element with icon and title', async () => {
    const { container, asFragment } = render(
      <KeyboardKey icon={{ prefix: 'fas', iconName: 'minus' }}>foo</KeyboardKey>
    )

    const elementWithTitle = await screen.getByTitle('foo')
    const iconElement = container.querySelector('svg')

    expect(elementWithTitle).toBeDefined()
    expect(elementWithTitle.children).toHaveLength(1)
    expect(iconElement.children).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })
})
