/* eslint-env jest */
import menus, { showMenu, clearMenus } from './menus'
import { showDialog } from './dialogs'

describe('menus reducer', () => {
  const initialState = null

  it('should handle initial state', () => {
    expect(menus(undefined, {})).toEqual(initialState)
  })

  it('should handle showMenu()', () => {
    expect(menus(initialState, showMenu('MENU_NAME'))).toEqual('MENU_NAME')
  })

  it('should handle clearMenus()', () => {
    expect(menus(initialState, clearMenus())).toEqual(null)
  })

  it('should handle extra reducers', () => {
    expect(menus(initialState, 'SHOW_GALLERY')).toEqual(null)
    expect(menus(initialState, 'START_PRINTING')).toEqual(null)
    expect(menus(initialState, showDialog())).toEqual(null)
  })
})
