import React from 'react'
import NotificationBar from './NotificationBar'
import NOTIFICATION from './notification.json'

function AppNotificationBar (): React.ReactElement {
  return <NotificationBar notification={NOTIFICATION} />
}

export default AppNotificationBar
