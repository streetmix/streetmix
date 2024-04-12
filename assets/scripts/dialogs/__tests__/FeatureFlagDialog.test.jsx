import React from 'react'
import { render } from '../../test/helpers/render'
import FeatureFlagDialog from '../FeatureFlagDialog'

const initialState = {
  flags: {
    FOO_BAR: {
      label: 'FOO_BAR',
      defaultValue: true,
      value: true,
      source: 'initial'
    },
    BAZ_QUX: {
      label: 'BAZ_QUX',
      defaultValue: true,
      value: false,
      source: 'initial'
    },
    FOO_BAZ: {
      label: 'FOO_BAZ',
      defaultValue: true,
      value: true,
      source: 'initial'
    },
    BAZ_BAR: {
      label: 'BAZ_BAR',
      defaultValue: true,
      enabled: false,
      value: false,
      source: 'initial'
    }
  }
}

describe('FeatureFlagDialog', () => {
  it('renders', () => {
    const { asFragment } = render(<FeatureFlagDialog />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it.todo('renders a disabled flag')
  it.todo('renders a flag whose value differs from the default value')
  it.todo('sets a feature flag when the checkbox is clicked')
  it.todo('sets a feature flag when the label is clicked')
  it.todo('closes the dialog when "Close" button is clicked')
})
