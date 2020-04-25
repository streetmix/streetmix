/**
 * About Streetmix (dialog box)
 *
 * Renders the "About" dialog box.
 *
 */
import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import Credits from './About/Credits.jsx' // Without extension, test will erroneously import .json instead
import { trackEvent } from '../app/event_tracking'
import logo from '../../images/logo_horizontal.svg'
import numoLogo from '../../images/sponsors/numo.svg'
import cfalogo from '../../images/sponsors/codeforamerica.png'
import mozlogo from '../../images/sponsors/mozilla.svg'
import './AboutDialog.scss'

function AboutDialog (props) {
  useEffect(() => {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }, [])

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="about-dialog">
          <header>
            <img
              src={logo}
              alt="Streetmix (logo)"
              className="about-dialog-logo"
            />
            <h1>
              <FormattedMessage
                id="dialogs.about.heading"
                defaultMessage="About Streetmix."
              />
            </h1>
          </header>
          <div className="dialog-content">
            <div className="about-dialog-content">
              <div className="about-dialog-left">
                <p>
                  <FormattedMessage
                    id="dialogs.about.description"
                    defaultMessage="Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community."
                  />
                </p>
                <h3>
                  <FormattedMessage
                    id="dialogs.about.partners"
                    defaultMessage="Partners"
                  />
                </h3>
                <ul className="about-dialog-sponsors">
                  <li>
                    <a
                      href="https://numo.global/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={numoLogo} alt="New Urban Mobility Alliance" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://codeforamerica.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={cfalogo} alt="Code for America" />
                    </a>
                  </li>
                </ul>
                <h3>
                  <FormattedMessage
                    id="dialogs.about.sponsors"
                    defaultMessage="Sponsors"
                  />
                </h3>
                <ul className="about-dialog-sponsors">
                  <li>
                    <a
                      href="https://www.mozilla.org/en-US/moss/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={mozlogo} alt="Mozilla Open Source Support" />
                    </a>
                  </li>
                </ul>
                <p>
                  <a
                    href="https://opencollective.com/streetmix/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="dialogs.about.donate-link"
                      defaultMessage="Support us financially"
                    />
                  </a>
                  <br />
                  <a
                    href="https://github.com/streetmix/streetmix/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="dialogs.about.open-source-link"
                      defaultMessage="We’re open source!&lrm;"
                    />
                  </a>
                  <br />
                  <a
                    href="https://medium.com/streetmixology"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="menu.contact.blog"
                      defaultMessage="Visit Streetmix blog"
                    />
                  </a>
                  <br />
                  <a
                    href="https://streetmix.readthedocs.io/en/latest/guidebook/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="dialogs.about.guidebook-link"
                      defaultMessage="Guidebook"
                    />
                  </a>
                </p>
                <p>
                  <a
                    href="https://streetmix.net/terms-of-service/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="dialogs.about.tos-link"
                      defaultMessage="Terms of service"
                    />
                  </a>
                  <br />
                  <a
                    href="https://streetmix.net/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="dialogs.about.privacy-link"
                      defaultMessage="Privacy policy"
                    />
                  </a>
                </p>
              </div>
              <div className="about-dialog-right">
                <Credits />
                <div className="credits-container">
                  <div>
                    <h3>
                      <FormattedMessage
                        id="dialogs.about.acknowledgements"
                        defaultMessage="Acknowledgements"
                      />
                    </h3>
                    <ul>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.font-designed-by"
                          defaultMessage="{fontName} font designed by {fontAuthor}."
                          values={{
                            fontName: (
                              <a
                                href="https://manropefont.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Manrope
                              </a>
                            ),
                            fontAuthor: (
                              <a
                                href="https://gent.media/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Mikhail Shiranda
                              </a>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (...chunks) => (
                              <a
                                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="SIL Open Font License, Version 1.1"
                              >
                                {chunks}
                              </a>
                            )
                          }}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.font-designed-by"
                          defaultMessage="{fontName} font designed by {fontAuthor}."
                          values={{
                            fontName: (
                              <a
                                href="https://hubertfischer.com/work/type-rubik"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Rubik
                              </a>
                            ),
                            fontAuthor: (
                              <a
                                href="https://hubertfischer.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Hubert & Fischer
                              </a>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (...chunks) => (
                              <a
                                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="SIL Open Font License, Version 1.1"
                              >
                                {chunks}
                              </a>
                            )
                          }}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.emoji-by"
                          defaultMessage="Emoji by {author}."
                          values={{
                            author: (
                              <a
                                href="https://openmoji.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                OpenMoji
                              </a>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (...chunks) => (
                              <a
                                href="https://creativecommons.org/licenses/by-sa/4.0/#"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
                              >
                                {chunks}
                              </a>
                            )
                          }}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.icons-by"
                          defaultMessage="Icons by {author}."
                          values={{
                            author: (
                              <a
                                href="https://fontawesome.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Font Awesome
                              </a>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (...chunks) => (
                              <a
                                href="https://fontawesome.com/license/free"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
                              >
                                {chunks}
                              </a>
                            )
                          }}
                        />
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

export default React.memo(AboutDialog)
