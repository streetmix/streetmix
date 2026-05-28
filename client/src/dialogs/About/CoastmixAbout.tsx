import { FormattedMessage } from 'react-intl'

import { ExternalLink } from '~/src/ui/ExternalLink.js'
import logoCoastmix from 'url:~/images/logo_horizontal_coastmix2.svg'
import crblogo from 'url:~/images/sponsors/coastmix/crb.png'
import oetlogo from 'url:~/images/sponsors/coastmix/oet.svg'
import './CoastmixAbout.css'

export function CoastmixAbout() {
  return (
    <>
      <header className="about-coastmix-header">
        <div>
          <img
            src={logoCoastmix}
            alt="Coastmix (logo)"
            className="about-coastmix-logo"
            draggable={false}
          />
          <h1>
            <FormattedMessage
              id="dialogs.about.heading"
              defaultMessage="About Coastmix."
            />
          </h1>
        </div>
        <div>
          <ExternalLink href="https://www.boston.gov/departments/climate-resilience">
            <img
              src={crblogo}
              alt="City of Boston Office of Climate Resilience"
              draggable={false}
            />
          </ExternalLink>
        </div>
        <div>
          <ExternalLink href="https://www.boston.gov/departments/emerging-technology">
            <img
              src={oetlogo}
              alt="City of Boston Office of Emerging Technology"
              style={{ width: '300px' }}
              draggable={false}
            />
          </ExternalLink>
        </div>
      </header>
      <div className="dialog-content about-coastmix-content">
        <p>
          Design, remix, and share your resilient coast. Create your ideal
          waterfront, build coastal flood protection, and learn how climate
          change can impact your community.{' '}
          {/* Coastmix is a project by Streetmix and the City of Boston to
                  visualize coastal flooding. */}
          <a href="" target="_blank">
            Learn more.
          </a>
        </p>

        <h2>Project team</h2>
        <ul>
          <li>
            <strong>Catherine McCandless</strong>
            <br />
            <i>Senior Climate Resilience Project Manager</i>
            <br />
            <i>Office of Climate Resilience</i>
          </li>
          <li>
            <strong>Katie Lewis</strong>
            <br />
            <i>Art Director</i>
            <br />
            <i>Streetmix</i>
          </li>
          <li>
            <strong>Kelly Sherman</strong>
            <br />
            <i>Climate Resilience Project Manager</i>
            <br />
            <i>Office of Climate Resilience</i>
          </li>
          <li>
            <strong>Lou Huang</strong>
            <br />
            <i>Project Lead</i>
            <br />
            <i>Streetmix</i>
          </li>
          <li>
            <strong>Michael Lawrence Evans</strong>
            <br />
            <i>Director</i>
            <br />
            <i>Office of Emerging Technology</i>
          </li>
        </ul>

        <h2 style={{ marginBottom: 0 }}>Special thanks to</h2>
        <div className="credits-container" style={{ marginTop: 0 }}>
          <div>
            <h3>City of Boston</h3>
            <ul>
              <li>
                <strong>Alice Brown,</strong> <i>Environment Department</i>
              </li>
              <li>
                <strong>Benjamin Matusow,</strong> <i>Planning Department</i>
              </li>
              <li>
                <strong>Christopher Osgood,</strong>{' '}
                <i>Office of Climate Resilience</i>
              </li>
              <li>
                <strong>Maddie Webster,</strong>{' '}
                <i>Transportation Department</i>
              </li>
              <li>
                <strong>Marin Braco,</strong> <i>Parks Department</i>
              </li>
              <li>
                <strong>Nayeli Rodriguez,</strong>{' '}
                <i>Office of Climate Resilience</i>
              </li>
              <li>
                <strong>Roua Atamaz Sibai</strong>,{' '}
                <i>Office of Emerging Technology</i>
              </li>
            </ul>
          </div>
          <div>
            <h3>Partners</h3>
            <ul>
              <li>
                <strong>Emma Gildesgame,</strong> <i>The Nature Conservancy</i>
              </li>
              <li>
                <strong>Joe Christo,</strong> <i>Stone Living Lab</i>
              </li>
              <li>
                <strong>Kalila Barnett,</strong> <i>Barr Foundation</i>
              </li>
              <li>
                <strong>Lindsey Butler,</strong> <i>Green Ribbon Commission</i>
              </li>
              <li>
                <strong>Nasser Brahim,</strong>{' '}
                <i>Mystic River Watershed Association</i>
              </li>
              <li>
                <strong>Rebecca Herst,</strong> <i>Green Ribbon Commission</i>
              </li>
              <li>
                <strong>Rebecca Shoer,</strong> <i>Boston Harbor Now</i>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
