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
          <Icon icon="github" className="social-github" />
        </a>
      </li>
      <li>
        <a
          href="https://strt.mx/discord"
          title="Discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="discord" className="social-discord" />
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
          <Icon icon="mastodon" className="social-mastodon" />
        </a>
      </li>
      <li>
        <a
          href="https://twitter.com/streetmix"
          title="Twitter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="twitter" className="social-twitter" />
        </a>
      </li>
      <li>
        <a
          href="https://www.instagram.com/streetmixapp/"
          title="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="instagram" className="social-instagram" />
        </a>
      </li>
    </ul>
  )
}

export default SocialLinks
