import { FormattedMessage } from 'react-intl'

import logo from 'url:~/images/logo_horizontal.svg'
import logoCoastmix from 'url:~/images/logo_horizontal_coastmix2.svg'
import numoLogo from 'url:~/images/sponsors/numo.svg'
import biflogo from 'url:~/images/sponsors/bif.svg'
import cfalogo from 'url:~/images/sponsors/codeforamerica.png'
import mozlogo from 'url:~/images/sponsors/mozilla.svg'
import crblogo from 'url:~/images/sponsors/coastmix/crb.png'
import iotlogo from 'url:~/images/sponsors/coastmix/iot.png'
import bostonlogo from 'url:~/images/sponsors/coastmix/boston.png'
import { useSelector } from '~/src/store/hooks.js'
import { ExternalLink } from '~/src/ui/ExternalLink.js'
import { Dialog } from '../Dialog.js'
import { Credits } from './Credits.js'
import { SocialLinks } from './SocialLinks.js'
import './AboutDialog.css'

export function AboutDialog() {
  const offline = useSelector((state) => state.system.offline)
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="about-dialog">
          <div className="dialog-content dialog-content-bleed">
            {coastmixMode && (
              <>
                <header>
                  <img
                    src={logoCoastmix}
                    alt="Coastmix (logo)"
                    className="coastmix-dialog-logo"
                  />
                  <h1>
                    <FormattedMessage
                      id="dialogs.about.heading"
                      defaultMessage="About Coastmix."
                    />
                  </h1>
                </header>
                <div className="about-dialog-content coastmix-dialog-content">
                  <div className="about-dialog-left">
                    <p>
                      Design, remix, and share your resilient coast. Create your
                      ideal waterfront, build coastal flood protection, and
                      learn how climate change can impact your community.{' '}
                      <a href="" target="_blank">
                        Learn more.
                      </a>
                    </p>
                    <ul className="about-dialog-sponsors">
                      <li>
                        <ExternalLink href="https://biffud.com/">
                          <img src={crblogo} alt="Bad Idea Factory" />
                        </ExternalLink>
                      </li>
                      <li>
                        <ExternalLink href="https://codeforamerica.org/">
                          <img src={iotlogo} alt="Code for America" />
                        </ExternalLink>
                      </li>{' '}
                      <li>
                        <ExternalLink href="https://codeforamerica.org/">
                          <img src={bostonlogo} alt="Code for America" />
                        </ExternalLink>
                      </li>
                    </ul>
                  </div>
                  <div className="about-dialog-right">
                    <h2>Project team</h2>
                    <ul>
                      <li>
                        Catherine McCandless,{' '}
                        <i>project lead, coastal resilience expert</i>
                      </li>
                      <li>
                        Katie Lewis, <i>art director, illustrator</i>
                      </li>
                      <li>
                        Kelly Sherman,{' '}
                        <i>project support, coastal resilience expert</i>
                      </li>
                      <li>
                        Lou Huang, <i>project lead, lead developer</i>
                      </li>
                      <li>
                        Michael Lawrence Evans,{' '}
                        <i>project lead, emerging tech expert</i>
                      </li>
                    </ul>

                    <h2>Special thanks to</h2>
                    <ul>
                      <li>
                        <h3>City of Boston</h3>
                        <ul>
                          <li>
                            Alice Brown, <i>Environment Department</i>
                          </li>
                          <li>
                            Benjamin Matusow, <i>Planning Department</i>
                          </li>
                          <li>
                            Christopher Osgood,{' '}
                            <i>Office of Climate Resilience</i>
                          </li>
                          <li>
                            Maddie Webster, <i>Transportation Department</i>
                          </li>
                          <li>
                            Marin Braco, <i>Parks Department</i>
                          </li>
                          <li>
                            Nayeli Rodriguez,{' '}
                            <i>Office of Climate Resilience</i>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <h3>Partners</h3>
                        <ul>
                          <li>
                            Emma Gildesgame, <i>The Nature Conservancy</i>
                          </li>
                          <li>
                            Joe Christo, <i>Stone Living Lab</i>
                          </li>
                          <li>
                            Kalila Barnett, <i>Barr Foundation</i>
                          </li>
                          <li>
                            Lindsey Butler, <i>Green Ribbon Commission</i>
                          </li>
                          <li>
                            Nasser Brahim,{' '}
                            <i>Mystic River Watershed Association</i>
                          </li>
                          <li>
                            Rebecca Herst, <i>Green Ribbon Commission</i>
                          </li>
                          <li>
                            Rebecca Shoer, <i>Boston Harbor Now</i>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
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
            <div className="about-dialog-content">
              <div className="about-dialog-left">
                <p>
                  <FormattedMessage
                    id="dialogs.about.description"
                    defaultMessage="Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community."
                  />
                </p>
                <SocialLinks />
                <h3>
                  <FormattedMessage
                    id="dialogs.about.stewards"
                    defaultMessage="Stewards"
                  />
                </h3>
                <ul className="about-dialog-sponsors">
                  <li>
                    <ExternalLink href="https://biffud.com/">
                      <img src={biflogo} alt="Bad Idea Factory" />
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
                {!offline && (
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
                            ),
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
                            ),
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
                            ),
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
                            ),
                          }}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.font-designed-by"
                          defaultMessage="{fontName} font designed by {fontAuthor}."
                          values={{
                            fontName: (
                              <ExternalLink href="https://delvefonts.com/fonts/overpass/">
                                Overpass
                              </ExternalLink>
                            ),
                            fontAuthor: (
                              <ExternalLink href="https://delvefonts.com/">
                                Delve Fonts
                              </ExternalLink>
                            ),
                          }}
                        />{' '}
                        <FormattedMessage
                          id="dialogs.about.license-label"
                          defaultMessage="(<a>License</a>)"
                          values={{
                            a: (chunks) => (
                              <ExternalLink
                                href="https://github.com/RedHatOfficial/Overpass/blob/master/OFL.txt"
                                title="SIL Open Font License, Version 1.1"
                              >
                                {chunks}
                              </ExternalLink>
                            ),
                          }}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          id="dialogs.about.icons-by"
                          defaultMessage="Icons by {author}."
                          values={{
                            author: (
                              <>
                                <ExternalLink href="https://tabler.io/icons">
                                  Tabler
                                </ExternalLink>
                                ,{' '}
                                <ExternalLink href="https://fontawesome.com/">
                                  Font Awesome
                                </ExternalLink>
                              </>
                            ),
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
                            ),
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
                            ),
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
                            ),
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
