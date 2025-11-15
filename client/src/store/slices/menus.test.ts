import menus, { showMenu, clearMenus } from './menus'
import { showGallery } from './gallery'
import { showDialog } from './dialogs'
import { startPrinting } from './app'

describe('menus reducer', () => {
  const initialState = null

  it('should handle showMenu()', () => {
    expect(menus(initialState, showMenu('MENU_NAME'))).toEqual('MENU_NAME')
  })

  it('should handle clearMenus()', () => {
    expect(menus(initialState, clearMenus())).toEqual(null)
  })

  it('should handle extra reducers', () => {
    expect(menus(initialState, showGallery('userid'))).toEqual(null)
    expect(menus(initialState, startPrinting())).toEqual(null)
    expect(menus(initialState, showDialog('dialogid'))).toEqual(null)
  })
})
