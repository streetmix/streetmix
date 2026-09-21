import { Icon } from '~/src/ui/Icon.js'
import './SocialLinks.css'

export function SocialLinks() {
  return (
    <ul className="social-links">
      <li>
        <a
          href="https://github.com/streetmix/"
          /* eslint-disable-next-line formatjs/no-literal-string-in-jsx */
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
          /* eslint-disable-next-line formatjs/no-literal-string-in-jsx */
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
          /* eslint-disable-next-line formatjs/no-literal-string-in-jsx */
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
          /* eslint-disable-next-line formatjs/no-literal-string-in-jsx */
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
