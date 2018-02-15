/* eslint-env jest */

export const undo = jest.fn()
export const redo = jest.fn()
export const isUndoAvailable = jest.fn().mockImplementation(() => true)
export const isRedoAvailable = jest.fn().mockImplementation(() => false)
