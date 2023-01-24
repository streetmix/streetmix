import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import ExternalLink from '../ui/ExternalLink'
import { SPONSOR_BANNER } from './config'
import './SponsorBanner.scss'

function SponsorBanner () {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)

  // Subscribers don't see sponsor banners
  if (isSubscriber) return null

  let banner = {}
  if (SPONSOR_BANNER !== undefined) {
    try {
      banner = JSON.parse(SPONSOR_BANNER)
    } catch (err) {
      console.log('Unable to parse sponsor banner configuration:', err)
    }
  }

  const { lede, text, link, linkText } = banner

  if (!lede && !text && !link) return null

  return (
    <div className="sponsor-banner">
      <span className="sponsor-title">Sponsor</span>
      {lede && (
        <>
          <strong className="notification-bar-intro">{lede}</strong>{' '}
        </>
      )}
      {text && (
        <>
          <span className="notification-bar-text">{text}</span>{' '}
        </>
      )}
      {link && (
        <ExternalLink href={link} className="notification-bar-link">
          {linkText || (
            <FormattedMessage id="msg.more-info" defaultMessage="More info" />
          )}
        </ExternalLink>
      )}
      <span>.</span>&nbsp;&nbsp;&nbsp;
      <span className="sponsor-banner-misc">
        <a
          href="https://about.streetmix.net/sponsorship/"
          target="_blank"
          rel="noopener noreferer noreferrer"
        >
          (What are sponsors?)
        </a>
      </span>
    </div>
  )
}

export default SponsorBanner
