const avatarCache = {}

export function hasCachedProfileImageUrl (userId) {
  return typeof avatarCache[userId] !== 'undefined'
}

export function getCachedProfileImageUrl (userId) {
  return avatarCache[userId]
}

export function receiveUserDetails (details) {
  if (details && details.id && details.profileImageUrl) {
    avatarCache[details.id] = details.profileImageUrl
    // throw an event so Avatar instances can check if the user they need was loaded
    window.dispatchEvent(new CustomEvent('stmx:user_details_received'))
  }
}
