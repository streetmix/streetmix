function _onAnotherUserIdClick(event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return;
  }

  var el = event.target;

  var userId = el.innerHTML;

  _showGallery(userId, false);

  event.preventDefault();
}

function _updateStreetMetadata() {
  var html = _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' width';
  document.querySelector('#street-width-read-width').innerHTML = html;

  if (street.remainingWidth > 0) {
    var html = '<span class="under">(' + _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' room)</span>';
  } else if (street.remainingWidth < 0) {
    var html = '<span class="over">(' + _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' over)</span>';
  } else {
    var html = '';
  }
  document.querySelector('#street-width-read-difference').innerHTML = html;

  if (street.creatorId && (!signedIn || (street.creatorId != signInData.userId))) {
    // TODO const
    var html = "by <div class='avatar' userId='" + street.creatorId + "'></div>" +
        "<a class='user-gallery' href='/" +
        street.creatorId + "'>" + street.creatorId + "</a>";

    document.querySelector('#street-metadata-author').innerHTML = html;

    _fetchAvatars();

    if (!readOnly) {
      document.querySelector('#street-metadata-author .user-gallery').
          addEventListener('click', _onAnotherUserIdClick);
    }
  } else if (!street.creatorId && (signedIn || remixOnFirstEdit)) {
    var html = 'by ' + msg('USER_ANONYMOUS');

    document.querySelector('#street-metadata-author').innerHTML = html;
  } else {
    document.querySelector('#street-metadata-author').innerHTML = '';
  }

  var html = _formatDate(moment(street.updatedAt));
  document.querySelector('#street-metadata-date').innerHTML = html;
}
