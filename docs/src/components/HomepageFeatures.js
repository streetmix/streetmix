import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'

import styles from './HomepageFeatures.module.css'

export default function HomepageFeatures() {
  return (
    <div className="row margin-vert--lg">
      <div className="col col--4 col--offset-2">
        <div
          className="text--center padding-horiz--md"
          style={{ height: '100%' }}
        >
          <Link
            to="/docs/contributing/intro"
            className={clsx(styles.featureLink)}
          >
            <div className={clsx('card', styles.featureCard)}>
              <div className="card__header">
                <h3>For developers and designers</h3>
              </div>
              <div className="card__body">
                <p>
                  Help us build Streetmix! Contribute code, content,
                  illustrations, or translations.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="col col--4">
        <div
          className="text--center padding-horiz--md"
          style={{ height: '100%' }}
        >
          <Link
            to="/docs/user-guide/intro"
            className={clsx(styles.featureLink)}
          >
            <div className={clsx('card', styles.featureCard)}>
              <div className="card__header">
                <h3>For planners and urbanists</h3>
              </div>
              <div className="card__body">
                <p>
                  Are you using Streetmix for civic engagement? Find tips,
                  tricks, and examples here.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
