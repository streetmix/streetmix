import React from 'react'
import { FormattedMessage } from 'react-intl'
import { IoBrushOutline } from 'react-icons/io5'
import { useSelector, useDispatch } from '../../store/hooks'
import { openGallery } from '../../store/actions/gallery'
import { useGetUserQuery } from '../../store/services/api'
import Avatar from '../../users/Avatar'
import { isOwnedByCurrentUser } from '../owner'

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
    <span className="street-metadata-author">
      <IoBrushOutline />
      <FormattedMessage
        id="users.byline"
        defaultMessage="by {user}"
        values={{ user }}
      />
    </span>
  )
}

export default StreetMetaAuthor
