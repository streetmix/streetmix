import React from 'react'
import { vi, beforeAll, afterAll } from 'vitest'
import { render } from '../../../../test/helpers/render'
import DateTimeRelative from '../DateTimeRelative'

// This will only test `en-US` (default) values. Assume that localized values
// will be handled accurately by the react-intl implementation.

describe('DateTimeRelative', () => {
  beforeAll(() => {
    // Mock system time for stable tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1524506400000)) // '2018-04-23T18:00:00.000Z'
  })

  afterAll(() => {
    // Restore system time
    vi.useRealTimers()
  })

  it('renders snapshot', () => {
    const { asFragment } = render(
      <DateTimeRelative value={new Date().toISOString()} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders "seconds ago" string', () => {
    const { container } = render(
      <DateTimeRelative value="2018-04-23T17:59:01.000Z" />
    )
    expect(container).toHaveTextContent('A few seconds ago')
  })

  it('renders "minutes ago" string', () => {
    const { container } = render(
      <DateTimeRelative value="2018-04-23T17:50:01.000Z" />
    )
    expect(container).toHaveTextContent('A few minutes ago')
  })

  it('renders "today at {time}" string', () => {
    // Pass in timezone as UTC to force it not to use server's time zone
    const { container } = render(
      <DateTimeRelative value="2018-04-23T12:00:00.000Z" timezone="UTC" />
    )
    expect(container).toHaveTextContent('Today at 12:00 PM')
  })

  it('renders "yesterday at {time}" string', () => {
    // Pass in timezone as UTC to force it not to use server's time zone
    const { container } = render(
      <DateTimeRelative value="2018-04-22T06:00:00.000Z" timezone="UTC" />
    )
    expect(container).toHaveTextContent('Yesterday at 6:00 AM')
  })

  it('renders a date that happened this year', () => {
    const { container } = render(
      <DateTimeRelative value="2018-02-03T18:00:00.000Z" />
    )
    expect(container).toHaveTextContent('February 3')
  })

  it('renders a date in another year', () => {
    const { container } = render(
      <DateTimeRelative value="2017-10-17T18:00:00.000Z" />
    )
    expect(container).toHaveTextContent('October 17, 2017')
  })
})
