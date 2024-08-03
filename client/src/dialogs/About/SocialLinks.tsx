import React from 'react'

import Icon from '~/src/ui/Icon'
import './SocialLinks.scss'

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
      <li>
        <a
          href="https://twitter.com/streetmix"
          title="Twitter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="twitter" className="social-twitter" />
        </a>
      </li>
      <li>
        <a
          href="https://www.instagram.com/streetmixapp/"
          title="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="instagram" className="social-instagram" />
        </a>
      </li>
    </ul>
  )
}

export default SocialLinks
