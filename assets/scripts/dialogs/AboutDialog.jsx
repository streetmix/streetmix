/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 * Instantiates an instance of Dialog
 *
 */
import React from 'react'
import Dialog from './Dialog'
import Avatar from '../users/Avatar'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'

export default class AboutDialog extends React.PureComponent {
  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }

  render () {
    return (
      <Dialog className="about-dialog">
        <h1>{t('dialogs.about.heading', 'About Streetmix.')}</h1>
        <div className="about-dialog-left">
          <p className="about-dialog-description">
            {t('dialogs.about.description', 'Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community.')}
          </p>
          <p className="about-dialog-description">
            {t('dialogs.about.sponsored-by', 'Streetmix is generously sponsored by:')}
          </p>
          <ul className="about-dialog-sponsors">
            <li>
              <a href="https://codeforamerica.org/" target="_blank">
                <img src="/images/sponsors/codeforamerica.png" alt="Code for America" height="48" />
              </a>
            </li>
            <li>
              <a href="https://lyft.com/" target="_blank">
                <img src="/images/sponsors/lyft.svg" alt="Lyft" height="48" />
              </a>
            </li>
          </ul>
          <p>
            <a href="https://opencollective.com/streetmix/" target="_blank">{t('dialogs.about.donate-link', 'Support us financially')}</a>
          </p>
        </div>
        <div className="about-dialog-right">
          <h3>{t('dialogs.about.team-heading', 'Project team and maintainers')}</h3>
          <ul className="about-dialog-team">
            <li>
              <a target="_blank" href="https://twitter.com/anselmbradford"><Avatar userId="anselmbradford" />Anselm Bradford</a> · media production
            </li>
            <li>
              <a target="_blank" href="http://ahhrrr.com"><Avatar userId="ahhrrr" />Ezra Spier</a> · cat herder, proto-urbanist
            </li>
            <li>
              <a target="_blank" href="https://twitter.com/klizlewis"><Avatar userId="klizlewis" />Katie Lewis</a> · illustrator
            </li>
            <li>
              <a target="_blank" href="https://louhuang.com"><Avatar userId="saikofish" />Lou Huang</a> · project lead, research, outreach, transit fan
            </li>
            <li>
              <a target="_blank" href="https://www.linkedin.com/pub/marc-hebert/1/2bb/66"><Avatar userId="anthromarc" />Marc Hébert</a> · UX researcher, design anthropologist
            </li>
            <li>
              <a target="_blank" href="https://aresluna.org"><Avatar userId="mwichary" />Marcin Wichary</a> · UX, FE, PM, sharrow whisperer
            </li>
            <li>
              <a target="_blank" href="https://twitter.com/shaunak"><Avatar userId="shaunak" />Shaunak Kashyap</a> · rear end engineering
            </li>
          </ul>

          <p>
            <a href="https://github.com/streetmix/streetmix/blob/master/CONTRIBUTING.md" target="_blank">{t('dialogs.about.github-link', 'Contribute to open source')}</a>
          </p>
        </div>
      </Dialog>
    )
  }
}
