/**
 * Feature flags
 *
 * For experimental features, alternate code paths, and debug helpers.
 *
 */

export const FEATURE_FLAGS = {
  GEOLOCATION: {
    label: 'Geolocation',
    defaultValue: false
  },
  INFO_BUBBLE_HOVER_POLYGON: {
    label: 'Info bubble — [debug] show Tognazzini zone',
    defaultValue: false
  },
  LOCALES_LEVEL_1: {
    label: 'Locales — level 1+ (in progress)',
    defaultValue: false,
    disabled: true
  },
  LOCALES_LEVEL_2: {
    label: 'Locales — level 2+ (complete, in testing)',
    defaultValue: false,
    disabled: true
  },
  LOCALES_LEVEL_3: {
    label: 'Locales — level 3 (complete, final)',
    defaultValue: false,
    disabled: true
  },
  SEGMENT_FLEX_ZONE: {
    label: 'Segment — flex zone',
    defaultValue: false,
    disabled: true
  },
  SEGMENT_INCEPTION_TRAIN: {
    label: 'Segment — the train from “Inception”',
    defaultValue: false,
    disabled: true
  },
  SEGMENT_ANGLED_PARKING: {
    label: 'Segment — angled parking',
    defaultValue: false,
    disabled: true
  },
  DEBUG_SEGMENT_CANVAS_RECTANGLES: {
    label: 'Segment — [debug] canvas rectangles',
    defaultValue: false
  },
  DONATE_NAG_SCREEN: {
    label: 'Donation nag screen',
    defaultValue: true
  }
}
