/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
import React from 'react'
import Dialog from './Dialog'
import Avatar from '../app/Avatar'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'

export default class AboutDialog extends React.Component {
  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }

  render () {
    return (
      <Dialog className='about-dialog'>
        <h1>{t('dialogs.about.heading', 'About Streetmix.')}</h1>
        <div className='about-dialog-left'>
          <div className='about-dialog-description'>
            {t('dialogs.about.description', 'Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community.')}
          </div>
          <ul>
            <li>
              <a href='http://blog.streetmix.net' target='_blank'>
                {t('menu.contact.blog', 'Visit Streetmix blog')}
              </a>
            </li>
            <li>
              <a href='https://github.com/streetmix/streetmix/' target='_blank'>
                {t('dialogs.about.view-source', 'View source code')}
              </a>
            </li>
          </ul>
        </div>
        <div className='about-dialog-right'>
          <p>
            A side project by <a target='_blank' href='http://codeforamerica.org'>Code for America</a> 2013 fellows:
          </p>
          <ul className='about-dialog-team'>
            <li>
              <a target='_blank' href='http://twitter.com/anselmbradford'><Avatar userId='anselmbradford' />Anselm Bradford</a> · media production
            </li>
            <li>
              <a target='_blank' href='http://ahhrrr.com'><Avatar userId='ahhrrr' />Ezra Spier</a> · cat herder, proto-urbanist
            </li>
            <li>
              <a target='_blank' href='http://twitter.com/klizlewis'><Avatar userId='klizlewis' />Katie Lewis</a> · illustrator
            </li>
            <li>
              <a target='_blank' href='http://louhuang.com'><Avatar userId='saikofish' />Lou Huang</a> · project lead, research, outreach, transit fan
            </li>
            <li>
              <a target='_blank' href='http://www.linkedin.com/pub/marc-hebert/1/2bb/66'><Avatar userId='anthromarc' />Marc Hébert</a> · UX researcher, design anthropologist
            </li>
            <li>
              <a target='_blank' href='http://aresluna.org'><Avatar userId='mwichary' />Marcin Wichary</a> · UX, FE, PM, sharrow whisperer
            </li>
            <li>
              <a target='_blank' href='http://twitter.com/shaunak'><Avatar userId='shaunak' />Shaunak Kashyap</a> · rear end engineering
            </li>
          </ul>
        </div>
      </Dialog>
    )
  }
}
