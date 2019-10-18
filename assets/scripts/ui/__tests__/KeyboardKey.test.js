/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import KeyboardKey from '../KeyboardKey'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('KeyboardKey', () => {
  it('renders a <kbd> element with string child', () => {
    const wrapper = renderWithReduxAndIntl(
      <KeyboardKey title="fo">foo</KeyboardKey>
    )
    expect(wrapper.getByText('foo').title).toBe('')
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders a <kbd> element with element child', () => {
    const wrapper = renderWithReduxAndIntl(
      <KeyboardKey>
        <strong>foo</strong>
      </KeyboardKey>
    )
    expect(wrapper.getByText('foo').title).toBe('')
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders a <kbd> element with icon and title', async () => {
    const wrapper = renderWithReduxAndIntl(
      <KeyboardKey icon={{ prefix: 'fas', iconName: 'minus' }}>foo</KeyboardKey>
    )

    const elementWithTitle = await wrapper.getByTitle('foo')
    const iconElement = wrapper.container.querySelector('svg')

    expect(elementWithTitle).toBeDefined()
    expect(elementWithTitle.children).toHaveLength(1)
    expect(iconElement.children).toBeDefined()
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
