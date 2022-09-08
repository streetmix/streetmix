import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { IoBrushOutline } from 'react-icons/io5'
import { openGallery } from '../store/actions/gallery'
import Avatar from '../users/Avatar'
import { isOwnedByCurrentUser } from './owner'

function StreetMetaAuthor (props) {
  const creatorId = useSelector((state) => state.street.creatorId)
  const signedIn = useSelector((state) => state.user.signedIn)
  const userId = useSelector((state) => state.user.signInData?.userId || '')
  const dispatch = useDispatch()

  function handleClickAuthor (event) {
    if (event) {
      event.preventDefault()
    }

    dispatch(openGallery({ userId: creatorId }))
  }

  let user
  if (creatorId && (!signedIn || creatorId !== userId)) {
    user = (
      <>
        <Avatar userId={creatorId} />
        <a href={'/' + creatorId} onClick={handleClickAuthor}>
          {creatorId}
        </a>
      </>
    )
  } else if (!creatorId && (signedIn || !isOwnedByCurrentUser())) {
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
