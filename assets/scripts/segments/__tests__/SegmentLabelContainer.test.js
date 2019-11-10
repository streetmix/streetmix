/* eslint-env jest */
import React from 'react'
import SegmentLabelContainer from '../SegmentLabelContainer'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../../users/constants'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

const testProps = {
  label: 'foo',
  width: 1,
  units: SETTINGS_UNITS_METRIC,
  locale: 'en'
}

describe('SegmentLabelContainer', () => {
  it('renders string label', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <SegmentLabelContainer {...testProps} label="bar" />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders React element label', () => {
    const TestComponent = <span>bar</span>
    const { asFragment } = renderWithReduxAndIntl(
      <SegmentLabelContainer {...testProps} label={TestComponent} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correct grid styling in metric', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <SegmentLabelContainer {...testProps} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correct grid styling in imperial', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <SegmentLabelContainer {...testProps} units={SETTINGS_UNITS_IMPERIAL} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders editable label', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <SegmentLabelContainer
        {...testProps}
        editable
        editSegmentLabel={() => {}}
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
