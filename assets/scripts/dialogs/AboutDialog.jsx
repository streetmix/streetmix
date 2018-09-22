/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { trackEvent } from '../app/event_tracking'

// Keep in alphabetical order by first name
const CORE_PEEPS = [
  {
    name: 'Elizabeth Ferrao',
    title: 'product manager',
    mugshotFile: 'elizabeth.jpg',
    url: 'https://twitter.com/musingmurmurs'
  },
  {
    name: 'Katie Lewis',
    title: 'art director, illustrator',
    mugshotFile: 'katie.jpg',
    url: 'https://twitter.com/klizlewis'
  },
  {
    name: 'Lou Huang',
    title: 'project lead',
    mugshotFile: 'lou.jpg',
    url: 'https://louhuang.com'
  },
  {
    name: 'Mandy Kong',
    mugshotFile: 'mandy.jpg',
    title: 'fullstack engineer'
  },
  {
    name: 'Oluwaseun Omoyajowo',
    mugshotFile: 'oluwaseun.jpg',
    title: 'fullstack engineer'
  },
  {
    name: 'Ryder Ross',
    mugshotFile: 'ryder.jpg',
    title: 'fullstack engineer'
  },
  {
    name: 'Trey Hahn',
    mugshotFile: 'trey.jpg',
    title: 'localization project manager'
  }
]

// Keep in alphabetical order by first name
const PAST_PEEPS = [
  {
    name: 'Anselm Bradford',
    title: 'media production',
    url: 'https://twitter.com/anselmbradford'
  },
  {
    name: 'Drew Dara-Abrams',
    mugshotFile: 'drew.jpg',
    title: 'fullstack engineer'
  },
  {
    name: 'Ezra Spier',
    title: 'engineer, spokesperson',
    mugshotFile: 'ezra.jpg',
    url: 'http://ahhrrr.com'
  },
  {
    name: 'Marc Hébert',
    title: 'design anthropologist',
    url: 'https://www.linkedin.com/pub/marc-hebert/1/2bb/66'
  },
  {
    name: 'Marcin Wichary',
    title: 'UI engineer, project manager',
    mugshotFile: 'marcin.jpg',
    url: 'https://aresluna.org'
  },
  {
    name: 'Shaunak Kashyap',
    title: 'backend engineer',
    mugshotFile: 'shaunak.jpg',
    url: 'https://twitter.com/shaunak'
  },
  {
    name: 'Shemar Dacosta',
    title: 'frontend engineer'
  },
  {
    name: 'Tomasz Magulski',
    mugshotFile: 'tomasz.jpg',
    title: 'engineer'
  }
]

export default class AboutDialog extends React.PureComponent {
  static propTypes = {
    closeDialog: PropTypes.func
  }

  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }

  renderTeamMember = (deets) => {
    const style = {}

    if (deets.mugshotFile) {
      style.backgroundImage = `url('/images/team/${deets.mugshotFile}')`
    }

    return (
      <div className="about-dialog-team-member" key={deets.name}>
        <a target="_blank" rel="noopener noreferrer" href={deets.url}>
          <div className="about-dialog-team-mugshot" style={style} />
          <span className="about-team-name">{deets.name}</span>
        </a>
        <span className="about-team-title">{deets.title}</span>
      </div>
    )
  }

  renderCoreTeamList = (peeps) => {
    return (
      <div className="about-dialog-team">
        {peeps.map(peep => this.renderTeamMember(peep))}
      </div>
    )
  }

  renderPastTeamList = (peeps) => {
    return (
      <div className="about-dialog-team about-dialog-team-past">
        {peeps.map(peep => this.renderTeamMember(peep))}
      </div>
    )
  }

  render () {
    return (
      <div className="dialog-type-2 about-dialog">
        <header>
          <div className="streetmix-logo" />
          <h1>
            <FormattedMessage id="dialogs.about.heading" defaultMessage="About Streetmix." />
          </h1>
        </header>
        <div className="dialog-content">
          <div className="about-dialog-content">
            <div className="about-dialog-left">
              <p>
                <FormattedMessage id="dialogs.about.description" defaultMessage="Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community." />
              </p>
              <p>
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
                <br />
                <a href="https://github.com/streetmix/streetmix/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="dialogs.about.open-source-link" defaultMessage="We’re open source!" />
                </a>
                <br />
                <a href="https://streetmix.readme.io/" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="dialogs.about.guidebook-link" defaultMessage="Guidebook" />
                </a>
              </p>
              <p>
                <a href="https://streetmix.net/terms-of-service/" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="dialogs.about.tos-link" defaultMessage="Terms of service" />
                </a>
                <br />
                <a href="https://streetmix.net/privacy-policy/" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="dialogs.about.privacy-link" defaultMessage="Privacy policy" />
                </a>
              </p>
            </div>
            <div className="about-dialog-right">
              <h2>
                <FormattedMessage id="dialogs.about.core-team-heading" defaultMessage="Project team" />
              </h2>

              {this.renderCoreTeamList(CORE_PEEPS)}

              <h2>
                <FormattedMessage id="dialogs.about.past-team-heading" defaultMessage="Past team members" />
              </h2>

              {/* experiment with smaller images for past team? */}
              {this.renderPastTeamList(PAST_PEEPS)}
              {/* {this.renderCoreTeamList(PAST_PEEPS)} */}

              <div className="about-dialog-credits-container">
                <div className="about-dialog-credits-left">
                  <h3>Advisors</h3>

                  <ul>
                    <li>Adrian Mak</li>
                    <li>Jeff Speck</li>
                    <li>Molly King</li>
                  </ul>

                  <h3>Additional illustrations</h3>

                  <ul>
                    <li>Doneliza Joaquin</li>
                    <li>Jon Reese</li>
                    <li>Peter Welte</li>
                  </ul>

                  <h3>Additional code</h3>

                  <ul>
                    <li>Alex Ellis</li>
                    <li>Ayush Rawal</li>
                    <li>Cody Moss</li>
                    <li>Don McCurdy</li>
                    <li>Joe James-Rodriguez</li>
                    <li>Kieran Farr</li>
                    <li>Maciej Kus</li>
                    <li>Radosław Miernik</li>
                    <li>Tommi Vainikainen</li>
                  </ul>

                  <h3>Additional contributors</h3>

                  <ul>
                    <li>Aline Reynolds, <i>storytelling</i></li>
                    <li>Amir Reavis-Bey, <i>database migration</i></li>
                    <li>Patrick McDonnell, <i>styleguide</i></li>
                    <li>Dave Guarino, <i>database admininistration</i></li>
                    <li>Jeremy Lechtzin, <i>law</i></li>
                    <li>Lisa Ratner, <i>user experience</i></li>
                    <li>Mebrak Tareke, <i>communications strategy</i></li>
                    <li>Nick Doiron, <i>right-to-left localization</i></li>
                  </ul>

                  <h3>Special thanks to</h3> {/* Don't alphabetize */}

                  <ul>
                    <li>Jen Pahlka, <i>for believing in us</i></li>
                    <li>Billy Riggs, <i>for the next most obvious thing</i></li>
                    <li>Michael Boswell, <i>ibid.</i></li>
                    <li>Pia Mancini, <i>donations</i></li>
                    <li>Matt Hampel, <i>engineering mentor</i></li>
                    <li>Brandon Liu, <i>engineering mentor</i></li>
                    <li>Debs Schrimmer, <i>flex zones</i></li>
                    <li>
                      <h4>Code for America</h4>
                      <ul>
                        <li>Alex Tran</li>
                        <li>Andrew Hyder</li>
                        <li>Mike Migurski</li>
                        <li>SaraT Mayer</li>
                      </ul>
                    </li>
                    <li>
                      <h4>NEW INC</h4>
                      <ul>
                        <li>Alex Darby</li>
                        <li>Julia Kaganskiy</li>
                        <li>Michelle Carollo</li>
                        <li>Rasu Jilani</li>
                        <li>Stephanie Pereira</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Civic Hall</h4>
                      <ul>
                        <li>Ellen Mendlow</li>
                        <li>Shaneka Ramdeen</li>
                      </ul>
                    </li>
                  </ul>

                </div>
                <div className="about-dialog-credits-right">
                  <h3>Translators</h3>

                  <ul>
                    <li>
                      <h4>Arabic</h4>
                      <ul>
                        <li>Diana M. Alhaj</li>
                        <li>Zakaria Shekhreet</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Chinese</h4>
                      <ul>
                        <li>Crystal Xing</li>
                        <li>Maggie Dong</li>
                        <li>Ricky Tsui</li>
                        <li>Summer Pan</li>
                        <li>Wen Jing Jiang</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Finnish</h4>
                      <ul>
                        <li>Aleksi Kinnunen</li>
                      </ul>
                    </li>
                    <li>
                      <h4>French</h4>
                      <ul>
                        <li>Denis Devillé</li>
                        <li>Jean-Louis Stanus</li>
                        <li>Philippe Provost</li>
                      </ul>
                    </li>
                    <li>
                      <h4>German</h4>
                      <ul>
                        <li>Julia Tahedl</li>
                        <li>Martin Niegl</li>
                        <li>Max Maaß</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Japanese</h4>
                      <ul>
                        <li>Hitomi Narakawa</li>
                        <li>Satoshi Iida</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Polish</h4>
                      <ul>
                        <li>Honorata Grzesikowska</li>
                        <li>Tomasz Magulski</li>
                        <li>Weronika Grzejszczak</li>
                        <li>Wojciech Patelka</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Portuguese (Brazil)</h4>
                      <ul>
                        <li>Carlos Jimenez</li>
                        <li>Carolina Guido <i>(Urb-i)</i></li>
                        <li>Paulo Franco <i>(Urb-i)</i></li>
                        <li>Stephan Garcia</li>
                        <li>Yuval Fogelson <i>(Urb-i)</i></li>
                      </ul>
                    </li>
                    <li>
                      <h4>Russian</h4>
                      <ul>
                        <li>Artem Savin</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Spanish (Mexico)</h4>
                      <ul>
                        <li>Paco Marquez</li>
                        <li>Patricio M. Ruiz Abrín</li>
                      </ul>
                    </li>
                    <li>
                      <h4>Swedish</h4>
                      <ul>
                        <li>Jakob Fahlstedt</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
        <footer onClick={this.props.closeDialog}>
          <FormattedMessage id="btn.close" defaultMessage="Close" />
        </footer>
      </div>
    )
  }
}
