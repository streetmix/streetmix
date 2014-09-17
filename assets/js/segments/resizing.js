function _normalizeAllSegmentWidths() {
  for (var i in street.segments) {
    street.segments[i].width =
        _normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL);
  }
}
