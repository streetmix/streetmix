function _updatePageTitle () {
  // TODO const/interpolate
  var title = street.name

  if (street.creatorId && (!signedIn || (signInData.userId != street.creatorId))) {
    title += ' (by ' + street.creatorId + ')'
  }

  title += ' – Streetmix'

  document.title = title
}

// TODO unify with above (this one doesn’t have author, for Facebook sharing)
function _getPageTitle () {
  return street.name + '– Streetmix'
}
