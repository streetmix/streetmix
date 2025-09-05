// Originally, our images were drawn at 2x for Retina display.
// As we've moved to vector images, "2x" is meaningless, but the intrinsic
// height/width dimensions have not changed.
export const TILESET_POINT_PER_PIXEL = 2.0 * 1.27 // this is a 1-inch to 1cm conversion
export const TILE_SIZE = 12 / 0.3048 // pixels, using imperial conversion rate to preserve render scale
export const TILE_SIZE_ACTUAL = TILE_SIZE * TILESET_POINT_PER_PIXEL // pixels

export const VERTICAL_SCALE_CHEAT_FACTOR = 3

export const MIN_SEGMENT_WIDTH = 0.25 // meters
export const MAX_SEGMENT_WIDTH = 120 // meters

export const DRAGGING_MOVE_HOLE_WIDTH = 40 // pixels

// Warnings are an array of booleans.
// Historically, the warning at 0 index is unused.
export const SEGMENT_WARNING_UNUSED = 0
export const SEGMENT_WARNING_OUTSIDE = 1
export const SEGMENT_WARNING_WIDTH_TOO_SMALL = 2
export const SEGMENT_WARNING_WIDTH_TOO_LARGE = 3
export const SEGMENT_WARNING_DANGEROUS_EXISTING = 4

export const SEGMENT_WIDTH_RESOLUTION_IMPERIAL = 0.25 * 0.3048 // feet => m
export const SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = 0.5 * 0.3048 // feet => m
export const SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = 0.5 * 0.3048 // feet => m

export const SEGMENT_WIDTH_RESOLUTION_METRIC = 0.05 // meters
export const SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 0.1 // meters
export const SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 0.1 // meters

export const DRAGGING_TYPE_NONE = 0
export const DRAGGING_TYPE_MOVE = 2
export const DRAGGING_TYPE_RESIZE = 3

export const MAX_SEGMENT_LABEL_LENGTH = 50

export const BUILDING_SPACE = 360
export const MAX_BUILDING_HEIGHT = 20 // floors
export const BUILDING_LEFT_POSITION = 'left'
export const BUILDING_RIGHT_POSITION = 'right'

export const ELEVATION_INCREMENT = 0.15 // meters
export const ELEVATION_INCREMENT_IMPERIAL = 0.5 * 0.3048 // feet => m
export const CURB_HEIGHT = ELEVATION_INCREMENT * 1
export const CURB_HEIGHT_IMPERIAL = ELEVATION_INCREMENT_IMPERIAL * 1
