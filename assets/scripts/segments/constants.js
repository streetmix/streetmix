// Originally, our images were drawn at 2x for Retina display.
// As we've moved to vector images, "2x" is meaningless, but the intrinsic
// height/width dimensions have not changed.
export const TILESET_POINT_PER_PIXEL = 2.0
export const TILE_SIZE = 12 // pixels
export const TILE_SIZE_ACTUAL = TILE_SIZE * TILESET_POINT_PER_PIXEL // pixels

export const MIN_SEGMENT_WIDTH = (1 / 0.3) * 0.25 // This is equal to 0.25m in our conversion rate
export const MAX_SEGMENT_WIDTH = 400

export const DRAGGING_MOVE_HOLE_WIDTH = 40 // pixels

export const SEGMENT_WARNING_OUTSIDE = 1
export const SEGMENT_WARNING_WIDTH_TOO_SMALL = 2
export const SEGMENT_WARNING_WIDTH_TOO_LARGE = 3

export const SEGMENT_WIDTH_RESOLUTION_IMPERIAL = 0.25
export const SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = 0.5
export const SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = 0.5

export const SEGMENT_WIDTH_RESOLUTION_METRIC = 1 / 6
export const SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 2 / 6
export const SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 2 / 6

export const DRAGGING_TYPE_NONE = 0
export const DRAGGING_TYPE_MOVE = 2
export const DRAGGING_TYPE_RESIZE = 3

export const MAX_SEGMENT_LABEL_LENGTH = 50
