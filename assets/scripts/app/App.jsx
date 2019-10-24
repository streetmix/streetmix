import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DndProvider } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'
import NOTIFICATION from '../../../app/data/notification.json'

import NotificationBar from './NotificationBar'
import MenusContainer from '../menus/MenusContainer'
import StreetNameplateContainer from '../streets/StreetNameplateContainer'
import InfoBubble from '../info_bubble/InfoBubble'
import WelcomePanel from './WelcomePanel'
import PaletteContainer from '../palette/PaletteContainer'
import DialogRoot from '../dialogs/DialogRoot'
import StatusMessage from './StatusMessage'
import NoConnectionMessage from './NoConnectionMessage'
import EnvironmentEditor from '../streets/EnvironmentEditor'
import Flash from './Flash'
import DebugInfo from './DebugInfo'
import Gallery from '../gallery/Gallery'
import BlockingShield from './BlockingShield'
import BlockingError from './BlockingError'
import StreetView from './StreetView'
import SegmentDragLayer from '../segments/SegmentDragLayer'
import DebugHoverPolygon from '../info_bubble/DebugHoverPolygon'
import PrintContainer from './PrintContainer'
import { onResize } from './window_resize'

class App extends React.PureComponent {
  static propTypes = {
    locale: PropTypes.object
  }

  componentDidMount () {
    onResize()
  }

  render () {
    return (
      <IntlProvider
        locale={this.props.locale.locale}
        key={this.props.locale.locale}
        messages={this.props.locale.messages}
      >
        {/* The prop context={window} prevents crash errors with hot-module reloading */}
        <DndProvider
          backend={MultiBackend}
          options={HTML5toTouch}
          context={window}
        >
          {/* DndProvider allows multiple children; IntlProvider does not */}
          <NotificationBar
            locale={this.props.locale.locale}
            notification={NOTIFICATION}
          />
          <BlockingShield />
          <BlockingError />
          <Gallery />
          <Flash />
          <DebugInfo />
          <PrintContainer />
          <div className="main-screen">
            <MenusContainer />
            <StreetNameplateContainer />
            <InfoBubble />
            <DebugHoverPolygon />
            <WelcomePanel />
            <PaletteContainer />
            <DialogRoot />
            <StatusMessage />
            <NoConnectionMessage />
            <EnvironmentEditor />
            <SegmentDragLayer />
            <StreetView />
          </div>
        </DndProvider>
      </IntlProvider>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale
  }
}

export default connect(mapStateToProps)(App)
