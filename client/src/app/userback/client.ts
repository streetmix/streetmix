import type { UserbackOptions, UserbackWidget } from '@userback/widget'
import { USERBACK_TOKEN } from '../config.js'
import './userback.css'

let userbackInstance: UserbackWidget

export async function initUserback(
  options?: UserbackOptions
): Promise<UserbackWidget | undefined> {
  if (!USERBACK_TOKEN) return

  // Conditionally import the Userback widget so that it does not get loaded
  // on instances where it is not meant to be installed.
  const mod = await import('@userback/widget')
  userbackInstance = await mod.default(USERBACK_TOKEN, options)

  return userbackInstance
}

export function getUserback(): UserbackWidget | undefined {
  return userbackInstance
}
