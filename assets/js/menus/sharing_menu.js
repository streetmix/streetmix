var TRACK_CATEGORY_SHARING = 'Sharing';
var TRACK_ACTION_FACEBOOK = 'Facebook';
var TRACK_ACTION_TWITTER = 'Twitter';

Stmx.ui.menus.shareMenu = new Stmx.ui.Menu('share', {
  alignment: 'right',
  onShowCallback: _focusShareLink
});

function _onShareMenuClick() {
  Stmx.ui.menus.shareMenu.onClick();
}

function _shareViaTwitter() {
  _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_TWITTER, null, null, false);
}

function _shareViaFacebook() {
  _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_FACEBOOK, null, null, false);
}

function _focusShareLink() {
  if (!system.touch) {
    window.setTimeout(function() {
      document.querySelector('#share-via-link').focus();
      document.querySelector('#share-via-link').select();
    }, 200);
  }
}

function _getSharingMessage() {
  var message = '';

  if (signedIn) {
    if (!street.creatorId) {
      message = 'Check out ' + street.name + ' street on Streetmix!';
    } else if (street.creatorId == signInData.userId) {
      message = 'Check out my street, ' + street.name + ', on Streetmix!';
    } else {
      message = 'Check out ' + street.name + ' street by @' + street.creatorId + ' on Streetmix!';
    }
  } else {
    message = 'Check out ' + street.name + ' street on Streetmix!';
  }

  return message;
}

function _updateFacebookLink(url) {
  var el = document.querySelector('#share-via-facebook');

  var text = _getSharingMessage();

  var appId = FACEBOOK_APP_ID;

  // TODO const
  el.href = 'https://www.facebook.com/dialog/feed' +
      '?app_id=' + encodeURIComponent(appId) +
      '&redirect_uri=' + encodeURIComponent(url) +
      '&link=' + encodeURIComponent(url) +
      '&name=' + encodeURIComponent(_getPageTitle()) +
      '&description=' + encodeURIComponent(htmlEncode(text));
}

function _updateTwitterLink(url) {
  var el = document.querySelector('#share-via-twitter');

  var text = _getSharingMessage();

  // TODO const
  el.href = 'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(text) +
      '&url=' + encodeURIComponent(url);
}

function _updateNakedLink(url) {
  document.querySelector('#share-via-link').value = url;
}

function _getSharingUrl() {
  var url = location.href;

  return url;
}

function _updateShareMenu() {
  var url = _getSharingUrl();

  _updateNakedLink(url);
  _updateTwitterLink(url);
  _updateFacebookLink(url);

  if (!signedIn) {
    document.querySelector('#sign-in-promo').classList.add('visible');
  }
}