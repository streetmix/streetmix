import React from 'react'

import { render } from '~/test/helpers/render'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '~/src/users/constants'
import SegmentLabelContainer from '../SegmentLabelContainer'

const testProps = {
  label: 'foo',
  width: 1,
  units: SETTINGS_UNITS_METRIC,
  locale: 'en'
}

describe('SegmentLabelContainer', () => {
  it('renders string label', () => {
    const { asFragment } = render(
      <SegmentLabelContainer {...testProps} label="bar" />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders React element label', () => {
    const TestComponent = <span>bar</span>
    const { asFragment } = render(
      <SegmentLabelContainer {...testProps} label={TestComponent} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correct grid styling in metric', () => {
    const { asFragment } = render(<SegmentLabelContainer {...testProps} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correct grid styling in imperial', () => {
    const { asFragment } = render(
      <SegmentLabelContainer {...testProps} units={SETTINGS_UNITS_IMPERIAL} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders editable label', () => {
    const { asFragment } = render(
      <SegmentLabelContainer
        {...testProps}
        editable={true}
        editSegmentLabel={() => {}}
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
