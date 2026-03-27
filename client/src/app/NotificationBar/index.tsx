import { NotificationBar as OriginalNotificationBar } from './NotificationBar.js'
import NOTIFICATION from './notification.json'

export function NotificationBar() {
  return <OriginalNotificationBar notification={NOTIFICATION} />
}
