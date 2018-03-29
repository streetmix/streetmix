/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 *
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'
import Avatar from '../users/Avatar'
import { trackEvent } from '../app/event_tracking'

export default class AboutDialog extends React.PureComponent {
  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }

  render () {
    return (
      <div className="about-dialog">
        <h1><FormattedMessage id="dialogs.about.heading" defaultMessage="About Streetmix." /></h1>
        <div className="about-dialog-left">
          <p className="about-dialog-description">
            <FormattedMessage id="dialogs.about.description" defaultMessage="Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community." />
          </p>
          <p className="about-dialog-description">
            <FormattedMessage id="dialogs.about.sponsored-by" defaultMessage="Streetmix is generously sponsored by:" />
          </p>
          <ul className="about-dialog-sponsors">
            <li>
              <a href="https://codeforamerica.org/" target="_blank" rel="noopener noreferrer">
                <img src="/images/sponsors/codeforamerica.png" alt="Code for America" height="48" />
              </a>
            </li>
            <li>
              <a href="https://lyft.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/sponsors/lyft.svg" alt="Lyft" height="48" />
              </a>
            </li>
          </ul>
          <p>
            <a href="https://opencollective.com/streetmix/" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="dialogs.about.donate-link" defaultMessage="Support us financially" />
            </a>
          </p>
        </div>
        <div className="about-dialog-right">
          <h3><FormattedMessage id="dialogs.about.team-heading" defaultMessage="Project team and maintainers" /></h3>
          <ul className="about-dialog-team">
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/anselmbradford"><Avatar userId="anselmbradford" />Anselm Bradford</a> · media production
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="http://ahhrrr.com"><Avatar userId="ahhrrr" />Ezra Spier</a> · cat herder, proto-urbanist
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/klizlewis"><Avatar userId="klizlewis" />Katie Lewis</a> · illustrator
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://louhuang.com"><Avatar userId="saikofish" />Lou Huang</a> · project lead, research, outreach, transit fan
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/pub/marc-hebert/1/2bb/66"><Avatar userId="anthromarc" />Marc Hébert</a> · UX researcher, design anthropologist
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://aresluna.org"><Avatar userId="mwichary" />Marcin Wichary</a> · UX, FE, PM, sharrow whisperer
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/shaunak"><Avatar userId="shaunak" />Shaunak Kashyap</a> · rear end engineering
            </li>
          </ul>

          <p>
            <a href="https://github.com/streetmix/streetmix/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="dialogs.about.github-link" defaultMessage="Contribute to open source" />
            </a>
          </p>
        </div>
      </div>
    )
  }
}
