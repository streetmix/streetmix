function _updatePageTitle() {
  // TODO const/interpolate
  var title = street.name;

  if (street.creator && street.creator.twitterId && (!signedIn || (signInData.twitterId != street.creator.twitterId))) {
    title += ' (by ' + street.creator.twitterId + ')';
  }

  title += ' – Streetmix';

  document.title = title;
}

// TODO unify with above (this one doesn’t have author, for Facebook sharing)
function _getPageTitle() {
  return street.name + '– Streetmix';
}
