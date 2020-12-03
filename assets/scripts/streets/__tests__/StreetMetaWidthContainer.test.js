/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import StreetMetaWidthContainer from '../StreetMetaWidthContainer'

describe('StreetMetaWidthContainer', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders selection dropdown on click', () => {
    const { asFragment } = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    userEvent.click(screen.getByTitle('Change width of the street'))
    expect(asFragment()).toMatchSnapshot()
  })

  it.skip('updates street label on selection change', () => {
    const updateStreetWidth = jest.fn()
    const changeValue = 10

    // TODO: the `updateStreetWidth` function is not passed in because
    // `renderWithReduxAndIntl()` does not allow props to override Redux connect
    // And the change value is called with the `40` not `changeValue`
    renderWithReduxAndIntl(
      <StreetMetaWidthContainer
        street={{}}
        updateStreetWidth={updateStreetWidth}
      />
    )
    userEvent.click(screen.getByTitle('Change width of the street'))
    userEvent.selectOptions(screen.getByRole('listbox'), changeValue)

    expect(updateStreetWidth).toBeCalledWith(changeValue)

    // Expect render to be label again
    expect(screen.getByRole('listbox')).toBe(null)
    expect(screen.getByTitle('Change width of the street')).not.toBe(null)
  })

  it.skip('does not render selection dropdown on click when not editable', () => {
    // TODO: This should pass, but `editable={false}` is never set
    // Either update `renderWithReduxAndIntl()` to allow props to override Redux connect,
    // or set initial state (even though it tightly couples component specification to Redux store)
    renderWithReduxAndIntl(
      <StreetMetaWidthContainer
        street={{}}
        editable={false}
        updateStreetWidth={jest.fn()}
      />
    )
    userEvent.click(screen.getByText('width', { exact: false }))

    expect(screen.getByRole('listbox')).toBe(null)
    expect(screen.getByText('width', { exact: false })).not.toBe(null)
  })

  // TODO: mock updateUnits() and test if it is called
  it.todo('updates units')
})
