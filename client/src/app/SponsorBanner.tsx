import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks'
import { ExternalLink } from '../ui/ExternalLink'
import { SPONSOR_BANNER } from './config'
import './SponsorBanner.css'

interface SponsorBannerProps {
  lede?: string
  text?: string
  link?: string // URL
  linkText?: string
}

function SponsorBanner(): React.ReactElement | null {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)

  // Subscribers don't see sponsor banners
  if (isSubscriber) return null

  // Bail if configuration is undefined
  if (SPONSOR_BANNER === undefined) return null

  let banner: SponsorBannerProps = {}
  try {
    banner = JSON.parse(SPONSOR_BANNER)
  } catch (err) {
    console.log('Unable to parse sponsor banner configuration:', err)
  }

  const { lede, text, link, linkText } = banner

  // If we're missing all the pieces, bail
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
          {linkText ?? (
            <FormattedMessage id="msg.more-info" defaultMessage="More info" />
          )}
        </ExternalLink>
      )}
      <span>.</span>&nbsp;&nbsp;&nbsp;
      <span className="sponsor-banner-misc">
        <a
          href="https://about.streetmix.net/sponsorship/"
          target="_blank"
          rel="noopener noreferrer"
        >
          (What are sponsors?)
        </a>
      </span>
    </div>
  )
}

export default SponsorBanner
