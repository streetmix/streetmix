import React from 'react'
import { FormattedMessage } from 'react-intl'

import TeamMember from './TeamMember'
import CREDITS from './credits.json'
import './Credits.css'

interface TeamMemberData {
  name: string
  title: string
  mugshotFile: string
  url?: string
  active: boolean
  original?: boolean
}

function alphabetizeNames (a: TeamMemberData, b: TeamMemberData): number {
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
  'nb-no': 'Norwegian Bokmål',
  pl: 'Polish',
  'pt-br': 'Portuguese (Brazil)',
  ru: 'Russian',
  sv: 'Swedish',
  zh: 'Chinese'
}

function Credits (): React.ReactElement {
  return (
    <>
      <h2>
        <FormattedMessage
          id="credits.original-team-heading"
          defaultMessage="Original project team"
        />
      </h2>

      <div className="credits-team credits-team-past">
        {CREDITS.team
          .filter((person) => person.original === true)
          .sort(alphabetizeNames)
          .map((person) => (
            <TeamMember {...person} key={person.name} />
          ))}
      </div>

      <h2>
        <FormattedMessage
          id="credits.core-contributors"
          defaultMessage="Core contributors"
        />
      </h2>

      <div className="credits-team credits-team-past">
        {CREDITS.team
          .filter((person) => person.original !== true)
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
                  defaultMessage={
                    UNTRANSLATED_LABELS[key as keyof typeof UNTRANSLATED_LABELS]
                  }
                />
              </h3>
              <ul>
                {/* eslint-disable-next-line @typescript-eslint/require-array-sort-compare */}
                {value.sort().map((name) =>
                  Array.isArray(name)
                    ? (
                      <li key={name[0]}>
                        {name[0]}, <i>{name[1]}</i>
                      </li>
                      )
                    : typeof name === 'string'
                      ? (
                        <li key={name}>{name}</li>
                        )
                      : (
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
                    defaultMessage={
                      UNTRANSLATED_LABELS[
                        key as keyof typeof UNTRANSLATED_LABELS
                      ]
                    }
                  />
                </h4>
                <ul>
                  {/* eslint-disable-next-line @typescript-eslint/require-array-sort-compare */}
                  {value.sort().map((name) =>
                    Array.isArray(name)
                      ? (
                        <li key={name[0]}>
                          {name[0]}, <i>{name[1]}</i>
                        </li>
                        )
                      : (
                        <li key={name}>{name}</li>
                        )
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Credits
