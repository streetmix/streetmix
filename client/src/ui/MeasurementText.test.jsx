import React from 'react'

import { render } from '~/test/helpers/render'
import MeasurementText from './MeasurementText'

describe('MeasurementText', () => {
  it('renders without crashing', () => {
    const { container } = render(<MeasurementText />)
    expect(container.childNodes).toBeDefined()
  })

  it('displays a value in metric units', () => {
    const { container } = render(
      <MeasurementText value={2.7} units={0} locale="en-US" />
    )
    expect(container.textContent).toEqual('2.7 m')
  })

  it('displays a value in metric units in French', () => {
    const { container } = render(
      <MeasurementText value={2.7} units={0} locale="fr" />
    )
    expect(container.textContent).toEqual('2,7 m')
  })

  it('displays a value in imperial units', () => {
    const { container } = render(
      <MeasurementText value={0.91} units={1} locale="en-US" />
    )
    expect(container.textContent).toEqual('3′')
  })

  it('displays a fractional value in imperial units', () => {
    const { container } = render(
      <MeasurementText value={1.067} units={1} locale="en-US" />
    )
    expect(container.textContent).toEqual('3½′')
  })
})
