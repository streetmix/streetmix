/* eslint-env jest */
import React from 'react'
import KeyboardKey from '../KeyboardKey'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { screen } from '@testing-library/react'

describe('KeyboardKey', () => {
  it('renders a <kbd> element with string child', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <KeyboardKey>foo</KeyboardKey>
    )
    expect(screen.getByText('foo').title).toBe('')
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders a <kbd> element with element child', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <KeyboardKey>
        <strong>foo</strong>
      </KeyboardKey>
    )
    expect(screen.getByText('foo').title).toBe('')
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders a <kbd> element with icon and title', async () => {
    const { container, asFragment } = renderWithReduxAndIntl(
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
