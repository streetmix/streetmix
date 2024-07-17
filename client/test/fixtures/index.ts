import type { UserProfile } from '~/src/types'
import FIXTURE_USER from './user.json'
import FIXTURE_STREET from './street.json'
import type { Street } from '@streetmix/types'

// This is a helper module that imports fixture JSON and re-exports as
// objects cast to their appropriate types. Workaround for
// https://github.com/microsoft/TypeScript/issues/32063

export const MOCK_USER: UserProfile = JSON.parse(JSON.stringify(FIXTURE_USER))
export const MOCK_STREET: Street = JSON.parse(JSON.stringify(FIXTURE_STREET))
