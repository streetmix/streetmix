/* eslint-env jest */
import React from 'react'
import { Dialog } from '../Dialog'
import { shallow } from 'enzyme'
import { mockIntl } from '../../../../test/__mocks__/react-intl'

describe('Dialog', () => {
  it('renders without crashing', () => {
    const Contents = 'foo'
    const wrapper = shallow(
      <Dialog closeDialog={jest.fn()} intl={mockIntl}><Contents /></Dialog>
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('listens for "escape" key when mounted', () => {})
  it('removes listener for "escape" key when unmounted', () => {})
  it('closes the dialog box when "escape" is pressed', () => {})
  it('closes the dialog when the background shield is clicked', () => {})
  it('does not close the dialog when the background shield is clicked, when `disableShieldExit` is `true`', () => {})
  it('closes the dialog when the background shield is clicked, when error state is true, even if `disableShieldExit` is `true`', () => {})
  it('catches an error in child components and handles it', () => {})
  it('closes the dialog box when the "x" button is pressed', () => {})
  it('passes the closeDialog function to the child component', () => {})
})
