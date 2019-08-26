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

  it.todo('listens for "escape" key when mounted')
  it.todo('removes listener for "escape" key when unmounted')
  it.todo('closes the dialog box when "escape" is pressed')
  it.todo('closes the dialog when the backdrop is clicked')
  it.todo('catches an error in child components and handles it')
  it.todo('closes the dialog box when the "x" button is pressed')
  it.todo('passes the closeDialog function to the child component')
})
