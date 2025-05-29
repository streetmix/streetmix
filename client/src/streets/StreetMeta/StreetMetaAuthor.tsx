import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { openGallery } from '~/src/store/actions/gallery'
import { useGetUserQuery } from '~/src/store/services/api'
import Icon from '~/src/ui/Icon'
import Avatar from '~/src/users/Avatar'
import { isOwnedByCurrentUser } from '../owner'
import StreetMetaItem from './StreetMetaItem'

function StreetMetaAuthor (): React.ReactElement | null {
  const creatorId = useSelector((state) => state.street.creatorId)
  const signedIn = useSelector((state) => state.user.signedIn)
  const userId = useSelector((state) => state.user.signInData?.userId ?? '')
  const { data: creatorProfile } = useGetUserQuery(creatorId)
  const dispatch = useDispatch()

  function handleClickAuthor (event: React.MouseEvent): void {
    event.preventDefault()
    dispatch(openGallery({ userId: creatorId }))
  }

  let user
  if (creatorId !== null && (!signedIn || creatorId !== userId)) {
    user = (
      <>
        <Avatar userId={creatorId} />
        <a href={'/' + creatorId} onClick={handleClickAuthor}>
          {creatorProfile?.displayName ?? creatorId}
        </a>
      </>
    )
  } else if (creatorId === null && (signedIn || !isOwnedByCurrentUser())) {
    user = <FormattedMessage id="users.anonymous" defaultMessage="Anonymous" />
  }

  if (!user) return null

  return (
    <StreetMetaItem icon={<Icon name="user" />}>
      <FormattedMessage
        id="users.byline"
        defaultMessage="by {user}"
        values={{ user }}
      />
    </StreetMetaItem>
  )
}

export default StreetMetaAuthor
