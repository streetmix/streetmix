import type { UserbackOptions, UserbackWidget } from '@userback/widget'
import { USERBACK_TOKEN } from '../config.js'
import './userback.css'

let userbackInstance: UserbackWidget

export async function initUserback(
  options?: UserbackOptions
): Promise<UserbackWidget | undefined> {
  if (!USERBACK_TOKEN) return

  // TODO: only activate on:
  // - Coastmix mode
  // - User signed in and is subscriber

  // Conditionally import the Userback widget so that it does not
  // run on deployments where it is not installed.
  const mod = await import('@userback/widget')
  userbackInstance = await mod.default(USERBACK_TOKEN, options)
}

export function getUserback() {
  return userbackInstance
}
