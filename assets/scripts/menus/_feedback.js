import { getSharingUrl } from '../util/share_url'
import Menu from './menu'

const TWITTER_ID = '@streetmix'

export let feedbackMenu = new Menu('feedback')

feedbackMenu.update = _updateFeedbackMenu

function _updateFeedbackMenu () {
  const el = document.querySelector('#feedback-via-twitter')

  const text = TWITTER_ID
  const url = getSharingUrl()

  // TODO const
  el.href = 'https://twitter.com/intent/tweet' +
    '?text=' + encodeURIComponent(text) +
    '&url=' + encodeURIComponent(url)
}
