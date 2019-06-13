import React from 'react'
import { FormattedMessage } from 'react-intl'
import TeamMember from './TeamMember'
import CREDITS from './credits.json'
import './Credits.scss'

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

function Credits (props) {
  return (
    <React.Fragment>
      <h2>
        <FormattedMessage id="credits.core-team-heading" defaultMessage="Project team" />
      </h2>

      <div className="credits-team">
        {
          CREDITS.team
            .filter(person => person.active)
            .sort(alphabetizeNames)
            .map(person => <TeamMember {...person} key={person.name} />)
        }
      </div>

      <h2>
        <FormattedMessage id="credits.past-team-heading" defaultMessage="Past team members" />
      </h2>

      <div className="credits-team credits-team-past">
        {
          CREDITS.team
            .filter(person => !person.active)
            .sort(alphabetizeNames)
            .map(person => <TeamMember {...person} key={person.name} />)
        }
      </div>

      <div className="credits-container">
        <div className="credits-credits-left">
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
        <div className="credits-credits-right">
          <h3><FormattedMessage id="credits.translators" defaultMessage="Translators" /></h3>

          <ul>
            {/* TODO: Alphabetize language names for each locale */}
            {/* TODO: set defaultMessage for untranslated locale names */}
            {Object.entries(CREDITS.translators)
              .map(([key, value]) => (
                <li key={key}>
                  <h4><FormattedMessage id={`i18n.lang.${key}`} /></h4>
                  <ul>
                    {value.sort().map(name => Array.isArray(name)
                      ? <li key={name[0]}>{name[0]}, <i>{name[1]}</i></li>
                      : <li key={name}>{name}</li>
                    )}
                  </ul>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Credits
