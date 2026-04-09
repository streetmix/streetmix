import { vi } from 'vitest'

import {
  deregisterKeypress,
  registerKeypress,
  startListening,
} from './keypress.js'

vi.mock('../util/focus.js', () => ({
  isFocusOnBody: vi.fn(() => true),
}))

function dispatchKeyDown(
  key: string,
  options: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    shiftKey: options.shiftKey,
    ctrlKey: options.ctrlKey,
    metaKey: options.metaKey,
  })

  window.dispatchEvent(event)
  return event
}

describe('keypress', () => {
  beforeAll(() => {
    startListening()
  })

  afterEach(() => {
    vi.clearAllMocks()

    // Remove all test registrations so each test starts clean.
    deregisterKeypress('ctrl s')
    deregisterKeypress('shift f')
    deregisterKeypress('esc')
    deregisterKeypress('escape')
    deregisterKeypress(['left', 'shift left'])
    deregisterKeypress(['shift ctrl z', 'ctrl y'])
    deregisterKeypress('?')
  })

  it('registers command + callback signature', () => {
    const callback = vi.fn()

    registerKeypress('ctrl s', callback)

    // Make sure it's only called once, and only when Ctrl is pressed
    dispatchKeyDown('s')
    expect(callback).toHaveBeenCalledTimes(0)

    dispatchKeyDown('s', { ctrlKey: true })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('registers command + options + callback signature', () => {
    const callback = vi.fn()

    registerKeypress(
      'shift f',
      {
        preventDefault: false,
      },
      callback
    )

    // Make sure it's only called once, and only when Shift is pressed
    dispatchKeyDown('f')
    expect(callback).toHaveBeenCalledTimes(0)

    const event = dispatchKeyDown('f', { shiftKey: true })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(false)
  })

  it('registers command + options signature using options.onKeypress', () => {
    const callback = vi.fn()

    registerKeypress('esc', { onKeypress: callback })
    dispatchKeyDown('Escape')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('handles array command combinations like left and shift left', () => {
    const callback = vi.fn()

    registerKeypress(['left', 'shift left'], callback)
    dispatchKeyDown('ArrowLeft')
    dispatchKeyDown('ArrowLeft', { shiftKey: true })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('deregisters all callbacks for a command when callback is omitted', () => {
    const callbackA = vi.fn()
    const callbackB = vi.fn()

    registerKeypress('esc', callbackA)
    registerKeypress('esc', callbackB)
    deregisterKeypress('esc')
    dispatchKeyDown('Escape')

    expect(callbackA).not.toHaveBeenCalled()
    expect(callbackB).not.toHaveBeenCalled()
  })

  it('deregisters only the matching callback when one is provided', () => {
    const callbackA = vi.fn()
    const callbackB = vi.fn()

    registerKeypress('esc', callbackA)
    registerKeypress('esc', callbackB)
    deregisterKeypress('esc', callbackA)
    dispatchKeyDown('Escape')

    expect(callbackA).not.toHaveBeenCalled()
    expect(callbackB).toHaveBeenCalledTimes(1)
  })

  it('deregisters array command callbacks for redo keys', () => {
    const callback = vi.fn()

    registerKeypress(['shift ctrl z', 'ctrl y'], callback)
    deregisterKeypress(['shift ctrl z', 'ctrl y'], callback)

    dispatchKeyDown('z', { shiftKey: true, ctrlKey: true })
    dispatchKeyDown('y', { ctrlKey: true })

    expect(callback).not.toHaveBeenCalled()
  })

  it('supports optional modifier settings used by question mark shortcuts', () => {
    const callback = vi.fn()

    registerKeypress('?', { shiftKey: 'optional' }, callback)

    dispatchKeyDown('?', { shiftKey: true })
    dispatchKeyDown('?', { shiftKey: false })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('fires once when fireOnce is enabled', () => {
    const callback = vi.fn()

    registerKeypress(['left', 'shift left'], { fireOnce: true }, callback)

    dispatchKeyDown('ArrowLeft')
    dispatchKeyDown('ArrowLeft')

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
