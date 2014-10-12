Stmx.ui.menus.settingsMenu = new Stmx.ui.Menu({
  name: 'settings',
  alignment: 'right',
  trackActionMsg: 'Open settings menu'
});

function _onSettingsMenuClick() {
  Stmx.ui.menus.settingsMenu.onClick();
}
