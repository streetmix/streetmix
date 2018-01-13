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
    label: 'Info bubble — show Tognazzini zone',
    defaultValue: false
  },
  LOCALES_LEVEL_1: {
    label: 'Locales — level 1+ (in progress)',
    defaultValue: false
  },
  LOCALES_LEVEL_2: {
    label: 'Locales — level 2+ (complete, in testing)',
    defaultValue: false
  },
  LOCALES_LEVEL_3: {
    label: 'Locales — level 3 (complete, final)',
    defaultValue: false
  },
  SEGMENT_FLEX_ZONE: {
    label: 'Segment — flex zone',
    defaultValue: false
  },
  SEGMENT_INCEPTION_TRAIN: {
    label: 'Segment — the train from “Inception”',
    defaultValue: false
  }
}
