/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import StreetMetaWidthContainer from '../StreetMetaWidthContainer'

describe('StreetMetaWidthContainer', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders selection dropdown on click', () => {
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    fireEvent.click(wrapper.getByTitle('Change width of the street'))
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it.skip('updates street label on selection change', () => {
    const updateStreetWidth = jest.fn()
    const changeValue = 10

    // TODO: the `updateStreetWidth` function is not passed in because
    // `renderWithReduxAndIntl()` does not allow props to override Redux connect
    // And the change value is called with the `40` not `changeValue`
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer street={{}} updateStreetWidth={updateStreetWidth} />)
    fireEvent.click(wrapper.getByTitle('Change width of the street'))
    fireEvent.change(wrapper.getByRole('listbox'), { target: { value: changeValue } })

    expect(updateStreetWidth).toBeCalledWith(changeValue)

    // Expect render to be label again
    expect(wrapper.getByRole('listbox')).toBe(null)
    expect(wrapper.getByTitle('Change width of the street')).not.toBe(null)
  })

  it.skip('does not render selection dropdown on click when not editable', () => {
    // TODO: This should pass, but `editable={false}` is never set
    // Either update `renderWithReduxAndIntl()` to allow props to override Redux connect,
    // or set initial state (even though it tightly couples component specification to Redux store)
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer street={{}} editable={false} updateStreetWidth={jest.fn()} />)
    fireEvent.click(wrapper.getByText('width', { exact: false }))

    expect(wrapper.getByRole('listbox')).toBe(null)
    expect(wrapper.getByText('width', { exact: false })).not.toBe(null)
  })

  // TODO: mock updateUnits() and test if it is called
  it.todo('updates units')
})
