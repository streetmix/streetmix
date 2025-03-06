import React from 'react'

import Icon from '~/src/ui/Icon'
import './SocialLinks.css'

function SocialLinks (): React.ReactElement {
  return (
    <ul className="social-links">
      <li>
        <a
          href="https://github.com/streetmix/"
          title="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="github" className="social-github" />
        </a>
      </li>
      <li>
        <a
          href="https://strt.mx/discord"
          title="Discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="discord" className="social-discord" />
        </a>
      </li>
      <li>
        <a
          href="https://bsky.app/profile/streetmix.app"
          title="Bluesky"
          target="_blank"
          rel="me noopener noreferrer"
        >
          <Icon name="bluesky" className="social-bluesky" />
        </a>
      </li>
      <li>
        {/*
          rel="me" is used to verify link ownership.
          see https://urbanists.social/settings/profile
        */}
        <a
          href="https://urbanists.social/@streetmix"
          title="Mastodon"
          target="_blank"
          rel="me noopener noreferrer"
        >
          <Icon name="mastodon" className="social-mastodon" />
        </a>
      </li>
    </ul>
  )
}

export default SocialLinks
