import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTwitter,
  faGithub,
  faDiscord,
  faInstagram,
  faMastodon
} from '@fortawesome/free-brands-svg-icons'
import './SocialLinks.scss'

function SocialLinks (props) {
  return (
    <ul className="social-links">
      <li>
        <a
          href="https://github.com/streetmix/"
          title="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} className="social-github" />
        </a>
      </li>
      <li>
        <a
          href="https://strt.mx/discord"
          title="Discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faDiscord} className="social-discord" />
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
          <FontAwesomeIcon icon={faMastodon} className="social-mastodon" />
        </a>
      </li>
      <li>
        <a
          href="https://twitter.com/streetmix"
          title="Twitter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faTwitter} className="social-twitter" />
        </a>
      </li>
      <li>
        <a
          href="https://www.instagram.com/streetmixapp/"
          title="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faInstagram} className="social-instagram" />
        </a>
      </li>
    </ul>
  )
}

export default SocialLinks
