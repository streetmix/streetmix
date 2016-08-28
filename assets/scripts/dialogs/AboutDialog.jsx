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
import { trackEvent } from '../app/event_tracking'
import { fetchAvatars } from '../users/avatars'
import { t } from '../app/locale'

export default class AboutDialog extends React.Component {
  componentDidMount () {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
    fetchAvatars()
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
              <a href='https://github.com/codeforamerica/streetmix/' target='_blank'>
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
              <a target='_blank' href='http://twitter.com/anselmbradford'><div className='avatar' data-user-id='anselmbradford' />Anselm Bradford</a> · media production
            </li>
            <li>
              <a target='_blank' href='http://ahhrrr.com'><div className='avatar' data-user-id='ahhrrr' />Ezra Spier</a> · cat herder, proto-urbanist
            </li>
            <li>
              <a target='_blank' href='http://twitter.com/klizlewis'><div className='avatar' data-user-id='klizlewis' />Katie Lewis</a> · illustrator
            </li>
            <li>
              <a target='_blank' href='http://louhuang.com'><div className='avatar' data-user-id='saikofish' />Lou Huang</a> · project lead, research, outreach, transit fan
            </li>
            <li>
              <a target='_blank' href='http://www.linkedin.com/pub/marc-hebert/1/2bb/66'><div className='avatar' data-user-id='anthromarc' />Marc Hébert</a> · UX researcher, design anthropologist
            </li>
            <li>
              <a target='_blank' href='http://aresluna.org'><div className='avatar' data-user-id='mwichary' />Marcin Wichary</a> · UX, FE, PM, sharrow whisperer
            </li>
            <li>
              <a target='_blank' href='http://twitter.com/shaunak'><div className='avatar' data-user-id='shaunak' />Shaunak Kashyap</a> · rear end engineering
            </li>
          </ul>
          <footer>
            Many thanks to the staff and 2013 CfA fellows for their support and patience,
            the Blockee team for paving the way, and all of our testers for their time and feedback!
          </footer>
        </div>
      </Dialog>
    )
  }
}
