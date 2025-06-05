import dialogs, { showDialog, clearDialogs } from './dialogs'

describe('dialogs reducer', () => {
  const initialState = {
    name: null
  }

  it('should handle showDialog()', () => {
    expect(dialogs(initialState, showDialog('DIALOG_NAME'))).toEqual({
      name: 'DIALOG_NAME'
    })
  })

  it('should handle clearDialogs()', () => {
    expect(dialogs(initialState, clearDialogs())).toEqual({
      name: null
    })
  })
})
