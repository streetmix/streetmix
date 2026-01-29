export const SEA_LEVEL_YEAR_2030 = 2030
export const SEA_LEVEL_YEAR_2050 = 2050
export const SEA_LEVEL_YEAR_2070 = 2070

// Estimates for City of Boston (in feet)
export const SEA_LEVEL_RISE_FEET = {
  [SEA_LEVEL_YEAR_2030]: 1.5,
  [SEA_LEVEL_YEAR_2050]: 2.5,
  [SEA_LEVEL_YEAR_2070]: 4.5,
}

// This was originally specc'd at 2 feet (but it was a rough guess anyway)
// Currently at 1.25 to account for visual effect (scaleY) of waves.
export const SURGE_HEIGHT_FEET = 1.25
