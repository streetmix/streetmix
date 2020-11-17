/* eslint-env jest */
import React from 'react'
import { renderWithIntl } from '../../../../test/helpers/render'
import Warnings from '../Warnings'

describe('Warnings', () => {
  // Note: warnings start indexing at 1!
  it('renders warning 1', () => {
    const segment = {
      warnings: [null, true]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)
    expect(container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
  })

  it('renders warning 2', () => {
    const segment = {
      warnings: [null, false, true, false]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)
    expect(container).toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders warning 3', () => {
    const segment = {
      warnings: [null, false, false, true]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)
    expect(container).toHaveTextContent('This segment might be too wide.')
  })

  it('renders two warnings', () => {
    const segment = {
      warnings: [null, true, false, true]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)

    expect(container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(container).toHaveTextContent('This segment might be too wide.')
    expect(container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders three warnings', () => {
    const segment = {
      warnings: [null, true, true, true]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)

    expect(container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(container).toHaveTextContent('This segment might be too wide.')
    expect(container).toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders no warnings', () => {
    const segment = {
      warnings: [null, false, false, false]
    }
    const { container } = renderWithIntl(<Warnings segment={segment} />)

    expect(container).not.toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This segment might be too wide.')
    expect(container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders nothing if segment has no warnings', () => {
    const segment = {}
    const { container } = renderWithIntl(<Warnings segment={segment} />)

    expect(container).not.toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This segment might be too wide.')
    expect(container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })
})
