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
    renderWithIntl(<Warnings segment={segment} />)
    expect(screen.container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
  })

  it('renders warning 2', () => {
    const segment = {
      warnings: [null, false, true, false]
    }
    renderWithIntl(<Warnings segment={segment} />)
    expect(screen.container).toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders warning 3', () => {
    const segment = {
      warnings: [null, false, false, true]
    }
    renderWithIntl(<Warnings segment={segment} />)
    expect(screen.container).toHaveTextContent(
      'This segment might be too wide.'
    )
  })

  it('renders two warnings', () => {
    const segment = {
      warnings: [null, true, false, true]
    }
    renderWithIntl(<Warnings segment={segment} />)

    expect(screen.container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(screen.container).toHaveTextContent(
      'This segment might be too wide.'
    )
    expect(screen.container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders three warnings', () => {
    const segment = {
      warnings: [null, true, true, true]
    }
    renderWithIntl(<Warnings segment={segment} />)

    expect(screen.container).toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(screen.container).toHaveTextContent(
      'This segment might be too wide.'
    )
    expect(screen.container).toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders no warnings', () => {
    const segment = {
      warnings: [null, false, false, false]
    }
    renderWithIntl(<Warnings segment={segment} />)

    expect(screen.container).not.toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(screen.container).not.toHaveTextContent(
      'This segment might be too wide.'
    )
    expect(screen.container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })

  it('renders nothing if segment has no warnings', () => {
    const segment = {}
    renderWithIntl(<Warnings segment={segment} />)

    expect(screen.container).not.toHaveTextContent(
      'This segment doesn’t fit within the street.'
    )
    expect(screen.container).not.toHaveTextContent(
      'This segment might be too wide.'
    )
    expect(screen.container).not.toHaveTextContent(
      'This segment might not be wide enough.'
    )
  })
})
