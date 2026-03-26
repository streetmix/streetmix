/* eslint @typescript-eslint/no-explicit-any: 0 */
export type KeypressCommands = string | string[]

export interface KeypressOptions {
  shiftKey?: boolean | 'optional'
  metaKey?: boolean | 'optional'
  altKey?: boolean | 'optional'
  preventDefault?: boolean
  stopPropagation?: boolean
  requireFocusOnBody?: boolean
  onKeypress?: (...args: any[]) => unknown
  condition?: (...args: any[]) => unknown
  fireOnce?: boolean
}

export type KeypressCallback = (...args: any[]) => unknown

export function startListening(): void

export function registerKeypress(
  commands: KeypressCommands,
  callback: KeypressCallback
): void

export function registerKeypress(
  commands: KeypressCommands,
  options: KeypressOptions,
  callback?: KeypressCallback
): void

export function deregisterKeypress(
  commands: KeypressCommands,
  callback?: KeypressCallback
): void
