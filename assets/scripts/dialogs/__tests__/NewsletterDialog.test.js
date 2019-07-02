/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import NewsletterDialog from '../NewsletterDialog'

// Mock Mailchimp HTML snippet
jest.mock('../Newsletter/mailchimp.html', () => '<div>foo</div>')

describe('NewsletterDialog', () => {
  afterEach(cleanup)

  it('renders snapshot', () => {
    const wrapper = renderWithReduxAndIntl(<NewsletterDialog />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
