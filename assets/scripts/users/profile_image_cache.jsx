const avatarCache = {}

export function getCachedProfileImageUrl (userId) {
  return avatarCache[userId]
}

export function receiveUserDetails (details) {
  if (details && details.id && details.profileImageUrl) {
    avatarCache[details.id] = details.profileImageUrl
  }
}
