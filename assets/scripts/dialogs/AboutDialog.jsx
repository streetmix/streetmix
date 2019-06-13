/**
 * About Streetmix (dialog box)
 *
 * Renders the "About" dialog box.
 *
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'
import TeamMember from './About/TeamMember'
import Dialog from './Dialog'
import { trackEvent } from '../app/event_tracking'
import './AboutDialog.scss'
import CREDITS from './About/credits.json'

function alphabetizeNames (a, b) {
  // Ignore case
  const nameA = a.name.toLowerCase()
  const nameB = b.name.toLowerCase()

  if (nameA < nameB) {
    return -1
  }

  if (nameA > nameB) {
    return 1
  }

  // If names are equal
  return 0
}

export default class AboutDialog extends React.PureComponent {
  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }

  renderCoreTeamList = (peeps) => {
    return (
      <div className="about-dialog-team">
        {peeps
          .filter(peep => peep.active)
          .sort(alphabetizeNames)
          .map(peep => <TeamMember {...peep} key={peep.name} />)}
      </div>
    )
  }

  renderPastTeamList = (peeps) => {
    return (
      <div className="about-dialog-team about-dialog-team-past">
        {peeps
          .filter(peep => !peep.active)
          .sort(alphabetizeNames)
          .map(peep => <TeamMember {...peep} key={peep.name} />)}
      </div>
    )
  }

  render () {
    return (
      <Dialog>
        {(closeDialog) => (
          <div className="about-dialog">
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
                        <img src="/images/sponsors/codeforamerica.png" alt="Code for America" />
                      </a>
                    </li>
                    <li>
                      <a href="https://lyft.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/images/sponsors/lyft.svg" alt="Lyft" />
                      </a>
                    </li>
                    <li>
                      <a href="https://www.mozilla.org/en-US/moss/" target="_blank" rel="noopener noreferrer">
                        <img src="/images/sponsors/mozilla.svg" alt="Mozilla Open Source Support" />
                      </a>
                    </li>
                  </ul>
                  <p>
                    <a href="https://opencollective.com/streetmix/" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="dialogs.about.donate-link" defaultMessage="Support us financially" />
                    </a>
                    <br />
                    <a href="https://github.com/streetmix/streetmix/" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="dialogs.about.open-source-link" defaultMessage="We’re open source!&lrm;" />
                    </a>
                    <br />
                    <a href="https://medium.com/streetmixology" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="menu.contact.blog" defaultMessage="Visit Streetmix blog" />
                    </a>
                    <br />
                    <a href="https://streetmix.readthedocs.io/en/latest/guidebook/" target="_blank" rel="noopener noreferrer">
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
                    <FormattedMessage id="credits.core-team-heading" defaultMessage="Project team" />
                  </h2>

                  {this.renderCoreTeamList(CREDITS.team)}

                  <h2>
                    <FormattedMessage id="credits.past-team-heading" defaultMessage="Past team members" />
                  </h2>

                  {this.renderPastTeamList(CREDITS.team)}

                  <div className="about-dialog-credits-container">
                    <div className="about-dialog-credits-left">
                      <h3><FormattedMessage id="credits.advisors" defaultMessage="Advisors" /></h3>

                      <ul>
                        <li>Adrian Mak</li>
                        <li>Jeff Speck</li>
                        <li>Molly King</li>
                      </ul>

                      <h3><FormattedMessage id="credits.additional-illustrations" defaultMessage="Additional illustrations" /></h3>

                      <ul>
                        <li>Brian Wamsley</li>
                        <li>Doneliza Joaquin</li>
                        <li>Jon Reese</li>
                        <li>Peter Welte</li>
                      </ul>

                      <h3><FormattedMessage id="credits.additional-code" defaultMessage="Additional code" /></h3>

                      <ul>
                        <li>Alex Ellis</li>
                        <li>Ayush Rawal</li>
                        <li>Cody Moss</li>
                        <li>Don McCurdy</li>
                        <li>Joe James-Rodriguez</li>
                        <li>Kieran Farr</li>
                        <li>Maciej Kus</li>
                        <li>Mila Frerichs</li>
                        <li>Radosław Miernik</li>
                        <li>Tommi Vainikainen</li>
                      </ul>

                      <h3><FormattedMessage id="credits.additional-contributors" defaultMessage="Additional contributors" /></h3>

                      <ul>
                        <li>Aline Reynolds, <i>writer and researcher</i></li>
                        <li>Amir Reavis-Bey, <i>database migration</i></li>
                        <li>Patrick McDonnell, <i>styleguide</i></li>
                        <li>Jeremy Lechtzin, <i>law</i></li>
                        <li>Justine Braisted, <i>branding</i></li>
                        <li>Lisa Ratner, <i>user experience</i></li>
                        <li>Mebrak Tareke, <i>communications strategy</i></li>
                        <li>Nick Doiron, <i>right-to-left localization</i></li>
                      </ul>

                      <h3><FormattedMessage id="credits.special-thanks" defaultMessage="Special thanks to" /></h3>

                      {/* Don't alphabetize */}
                      <ul>
                        <li>Jen Pahlka, <i>for believing in us</i></li>
                        <li>Billy Riggs, <i>for the next most obvious thing</i></li>
                        <li>Michael Boswell, <i>ibid.</i></li>
                        <li>Pia Mancini, <i>donations</i></li>
                        <li>Matt Hampel, <i>engineering mentor</i></li>
                        <li>Brandon Liu, <i>engineering mentor</i></li>
                        <li>Debs Schrimmer, <i>flex zones</i></li>
                        <li>Rob McPherson, <i>scooters</i></li>
                        <li>
                          <h4>Code for America</h4>
                          <ul>
                            <li>Alex Tran</li>
                            <li>Andrew Hyder</li>
                            <li>Dave Guarino</li>
                            <li>Mike Migurski</li>
                            <li>SaraT Mayer</li>
                          </ul>
                        </li>
                        <li>
                          <h4>NEW INC</h4>
                          <ul>
                            <li>Alex Darby</li>
                            <li>Julia Kaganskiy</li>
                            <li>Kelsa Trom</li>
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
                      <h3><FormattedMessage id="credits.translators" defaultMessage="Translators" /></h3>

                      <ul>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.ar" defaultMessage="Arabic" /></h4>
                          <ul>
                            <li>Diana M. Alhaj</li>
                            <li>Zakaria Shekhreet</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.zh" defaultMessage="Chinese" /></h4>
                          <ul>
                            <li>Crystal Xing</li>
                            <li>Maggie Dong</li>
                            <li>Ricky Tsui</li>
                            <li>Summer Pan</li>
                            <li>Wen Jing Jiang</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.fi" defaultMessage="Finnish" /></h4>
                          <ul>
                            <li>Aleksi Kinnunen</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.fr" defaultMessage="French" /></h4>
                          <ul>
                            <li>Denis Devillé</li>
                            <li>Jean-Louis Stanus</li>
                            <li>Philippe Provost</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.de" defaultMessage="German" /></h4>
                          <ul>
                            <li>Julia Tahedl</li>
                            <li>Martin Niegl</li>
                            <li>Max Maaß</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.ja" defaultMessage="Japanese" /></h4>
                          <ul>
                            <li>Hitomi Narakawa</li>
                            <li>Satoshi Iida</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.pl" defaultMessage="Polish" /></h4>
                          <ul>
                            <li>Honorata Grzesikowska</li>
                            <li>Tomasz Magulski</li>
                            <li>Weronika Grzejszczak</li>
                            <li>Wojciech Patelka</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.pt-br" defaultMessage="Portuguese (Brazil)" /></h4>
                          <ul>
                            <li>Carlos Jimenez</li>
                            <li>Carolina Guido <i>(Urb-i)&lrm;</i></li>
                            <li>Paulo Franco <i>(Urb-i)&lrm;</i></li>
                            <li>Stephan Garcia</li>
                            <li>Yuval Fogelson <i>(Urb-i)&lrm;</i></li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.ru" defaultMessage="Russian" /></h4>
                          <ul>
                            <li>Artem Savin</li>
                            <li>Olya Arakhouskaya</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.es-mx" defaultMessage="Spanish (Mexico)" /></h4>
                          <ul>
                            <li>David Soto Padín</li>
                            <li>Paco Marquez</li>
                            <li>Patricio M. Ruiz Abrín</li>
                          </ul>
                        </li>
                        <li>
                          <h4><FormattedMessage id="i18n.lang.sv" defaultMessage="Swedish" /></h4>
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
            <button className="dialog-primary-action" onClick={closeDialog}>
              <FormattedMessage id="btn.close" defaultMessage="Close" />
            </button>
          </div>
        )}
      </Dialog>
    )
  }
}
