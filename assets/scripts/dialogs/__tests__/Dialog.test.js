/* eslint-env jest */
import React from 'react'
import { Dialog } from '../Dialog'
import { shallow } from 'enzyme'

describe('Dialog', () => {
  it('renders without crashing', () => {
    const Contents = 'foo'
    const wrapper = shallow(
      <Dialog clearDialogs={jest.fn()}>
        {(closeDialog) => <Contents />}
      </Dialog>
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('listens for "escape" key when mounted', () => {})
  it('removes listener for "escape" key when unmounted', () => {})
  it('closes the dialog box when "escape" is pressed', () => {})
  it('closes the dialog when the backdrop is clicked', () => {})
  it('catches an error in child components and handles it', () => {})
  it('closes the dialog box when the "x" button is pressed', () => {})
  it('passes the closeDialog function to the child component', () => {})
})
