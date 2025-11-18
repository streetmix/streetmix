import menus, { showMenu, clearMenus } from './menus'
import { showGallery } from './gallery'
import { showDialog } from './dialogs'
import { startPrinting } from './app'

describe('menus reducer', () => {
  const initialState = {
    id: null
  }

  it('should handle showMenu()', () => {
    expect(menus(initialState, showMenu('MENU_NAME')).id).toEqual('MENU_NAME')
  })

  it('should handle clearMenus()', () => {
    expect(menus(initialState, clearMenus()).id).toEqual(null)
  })

  it('should handle extra reducers', () => {
    expect(menus(initialState, showGallery('userid')).id).toEqual(null)
    expect(menus(initialState, startPrinting()).id).toEqual(null)
    expect(menus(initialState, showDialog('dialogid')).id).toEqual(null)
  })
})
