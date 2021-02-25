/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import NewsletterDialog from '../NewsletterDialog'

// Mock Mailchimp HTML snippet
jest.mock('../Newsletter/mailchimp.html', () => '<div>foo</div>')

describe('NewsletterDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<NewsletterDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
