import React from 'react'
import { FormattedMessage } from 'react-intl'
import TeamMember from './TeamMember'
import CREDITS from './credits.json'
import './Credits.scss'

// NOTE: on testing this component
//
// The `<Credits />` component is rendered inside of a snapshot of `<AboutDialog />`
// and does not need to be unit-tested on its own. When `<AboutDialog />` renders a
// snapshot, it uses a mock version of `credits.json`. This allows the component to
// test rendering logic without needing to change the snapshot when the credits
// themselves change.

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

// This is a temporary stash of English-language labels for credits
// because right now we don't have a way to fall back when a label is untranslated.
// We can remove this once this has been built into our localization infrastructure.
const UNTRANSLATED_LABELS = {
  advisors: 'Advisors',
  'additional-illustrations': 'Additional illustrations',
  'additional-code': 'Additional code',
  'additional-contributors': 'Additional contributors',
  'special-thanks': 'Special thanks to',
  ar: 'Arabic',
  ca: 'Catalan',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  'es-mx': 'Spanish (Mexico)',
  'es-419': 'Spanish (Latin America)',
  fi: 'Finnish',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  'pt-br': 'Portuguese (Brazil)',
  ru: 'Russian',
  sv: 'Swedish',
  zh: 'Chinese'
}

function Credits (props) {
  return (
    <>
      <h2>
        <FormattedMessage
          id="credits.core-team-heading"
          defaultMessage="Project team"
        />
      </h2>

      <div className="credits-team">
        {CREDITS.team
          .filter((person) => person.active)
          .sort(alphabetizeNames)
          .map((person) => (
            <TeamMember {...person} key={person.name} />
          ))}
      </div>

      <h2>
        <FormattedMessage
          id="credits.past-team-heading"
          defaultMessage="Past team members"
        />
      </h2>

      <div className="credits-team credits-team-past">
        {CREDITS.team
          .filter((person) => !person.active)
          .sort(alphabetizeNames)
          .map((person) => (
            <TeamMember {...person} key={person.name} />
          ))}
      </div>

      <div className="credits-container">
        <div className="credits-credits-left">
          {Object.entries(CREDITS.contributors).map(([key, value]) => (
            <React.Fragment key={key}>
              <h3>
                <FormattedMessage
                  id={`credits.${key}`}
                  defaultMessage={UNTRANSLATED_LABELS[key]}
                />
              </h3>
              <ul>
                {value.sort().map((name) =>
                  Array.isArray(name) ? (
                    <li key={name[0]}>
                      {name[0]}, <i>{name[1]}</i>
                    </li>
                  ) : typeof name === 'string' ? (
                    <li key={name}>{name}</li>
                  ) : (
                    <li key={name.label}>
                      <h4>{name.label}</h4>
                      <ul>
                        {name.people.map((person) => (
                          <li key={person}>{person}</li>
                        ))}
                      </ul>
                    </li>
                  )
                )}
              </ul>
            </React.Fragment>
          ))}
        </div>
        <div className="credits-credits-right">
          <h3>
            <FormattedMessage
              id="credits.translators"
              defaultMessage="Translators"
            />
          </h3>

          <ul>
            {/* TODO: Alphabetize language names for each locale */}
            {Object.entries(CREDITS.translators).map(([key, value]) => (
              <li key={key}>
                <h4>
                  <FormattedMessage
                    id={`i18n.lang.${key}`}
                    defaultMessage={UNTRANSLATED_LABELS[key]}
                  />
                </h4>
                <ul>
                  {value.sort().map((name) =>
                    Array.isArray(name) ? (
                      <li key={name[0]}>
                        {name[0]}, <i>{name[1]}</i>
                      </li>
                    ) : (
                      <li key={name}>{name}</li>
                    )
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="credits-container">
        <div>
          <h3>Acknowledgements</h3>
          <ul>
            <li>
              <strong>
                <a
                  href="https://manropefont.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Manrope
                </a>
              </strong>{' '}
              font designed by{' '}
              <a
                href="https://gent.media/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mikhail Shiranda
              </a>
              . (
              <a
                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                target="_blank"
                rel="noopener noreferrer"
                title="SIL Open Font License, Version 1.1"
              >
                License
              </a>
              )
            </li>
            <li>
              <strong>
                <a
                  href="https://hubertfischer.com/work/type-rubik"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rubik
                </a>
              </strong>{' '}
              font designed by{' '}
              <a
                href="https://hubertfischer.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hubert & Fischer
              </a>
              . (
              <a
                href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL"
                target="_blank"
                rel="noopener noreferrer"
                title="SIL Open Font License, Version 1.1"
              >
                License
              </a>
              )
            </li>
            <li>
              Emoji by{' '}
              <strong>
                <a
                  href="https://openmoji.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenMoji
                </a>
              </strong>
              . (
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/#"
                target="_blank"
                rel="noopener noreferrer"
                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
              >
                License
              </a>
              )
            </li>
            <li>
              Icons by{' '}
              <strong>
                <a
                  href="https://fontawesome.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Font Awesome
                </a>
              </strong>
              . (
              <a
                href="https://fontawesome.com/license/free"
                target="_blank"
                rel="noopener noreferrer"
                title="Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)"
              >
                License
              </a>
              )
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Credits
