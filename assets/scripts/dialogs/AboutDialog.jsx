/**
 * About Streetmix (dialog box)
 *
 * Renders the "About" dialog box.
 *
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import Dialog from './Dialog'
import Credits from './About/Credits.jsx' // Without extension, test will erroneously import .json instead
import ExternalLink from '../ui/ExternalLink'
import logo from '../../images/logo_horizontal.svg'
import numoLogo from '../../images/sponsors/numo.svg'
import cfalogo from '../../images/sponsors/codeforamerica.png'
import mozlogo from '../../images/sponsors/mozilla.svg'
import './AboutDialog.scss'

function AboutDialog (props) {
  const noInternet = useSelector((state) => state.system.noInternet)

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
                    <ExternalLink href="https://numo.global/">
                      <img src={numoLogo} alt="New Urban Mobility Alliance" />
                    </ExternalLink>
                  </li>
                  <li>
                    <ExternalLink href="https://codeforamerica.org/">
                      <img src={cfalogo} alt="Code for America" />
                    </ExternalLink>
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
                    <ExternalLink href="https://www.mozilla.org/en-US/moss/">
                      <img src={mozlogo} alt="Mozilla Open Source Support" />
                    </ExternalLink>
                  </li>
                </ul>
                {!noInternet && (
                  <>
                    <p>
                      <ExternalLink href="https://opencollective.com/streetmix/">
                        <FormattedMessage
                          id="dialogs.about.donate-link"
                          defaultMessage="Support us financially"
                        />
                      </ExternalLink>
                      <br />
                      <ExternalLink href="https://github.com/streetmix/streetmix/">
                        <FormattedMessage
                          id="dialogs.about.open-source-link"
                          defaultMessage="We’re open source!&lrm;"
                        />
                      </ExternalLink>
                      <br />
                      <ExternalLink href="https://medium.com/streetmixology">
                        <FormattedMessage
                          id="menu.contact.blog"
                          defaultMessage="Visit Streetmix blog"
                        />
                      </ExternalLink>
                      <br />
                      <ExternalLink href="https://streetmix.readthedocs.io/en/latest/guidebook/">
                        <FormattedMessage
                          id="dialogs.about.guidebook-link"
                          defaultMessage="Guidebook"
                        />
                      </ExternalLink>
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
                  </>
                )}
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
                              <ExternalLink href="https://manropefont.com/">
                                Manrope
                              </ExternalLink>
                            ),
                            fontAuthor: (
                              <ExternalLink href="https://gent.media/">
                                Mikhail Shiranda
                              </ExternalLink>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (chunks) => (
                              <ExternalLink
                                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                                title="SIL Open Font License, Version 1.1"
                              >
                                {chunks}
                              </ExternalLink>
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
                              <ExternalLink href="https://hubertfischer.com/work/type-rubik">
                                Rubik
                              </ExternalLink>
                            ),
                            fontAuthor: (
                              <ExternalLink href="https://hubertfischer.com/">
                                Hubert & Fischer
                              </ExternalLink>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (chunks) => (
                              <ExternalLink
                                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                                title="SIL Open Font License, Version 1.1"
                              >
                                {chunks}
                              </ExternalLink>
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
                              <ExternalLink href="https://openmoji.org/">
                                OpenMoji
                              </ExternalLink>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (chunks) => (
                              <ExternalLink
                                href="https://creativecommons.org/licenses/by-sa/4.0/#"
                                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
                              >
                                {chunks}
                              </ExternalLink>
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
                              <ExternalLink href="https://fontawesome.com/">
                                Font Awesome
                              </ExternalLink>
                            )
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (chunks) => (
                              <ExternalLink
                                href="https://fontawesome.com/license/free"
                                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
                              >
                                {chunks}
                              </ExternalLink>
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
