// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import SLICE_LOOKUP from '../../../client/src/segments/segment-lookup.json' with { type: 'json' }
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'
import { prettifyWidth } from './dimensions.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const LABEL_BACKGROUND = 'rgb(216, 211, 203)'
const LABEL_FONT = 'Geist Sans'
const LABEL_FONT_SIZE = 12
const LABEL_FONT_WEIGHT = '400'

/**
 * Draws slice label background.
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawLabelBackground (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  groundLevel: number,
  scale: number
): void {
  ctx.save()

  ctx.fillStyle = LABEL_BACKGROUND
  ctx.fillRect(
    0,
    (groundLevel + GROUND_BASELINE_HEIGHT) * scale,
    width * scale,
    (height - groundLevel - GROUND_BASELINE_HEIGHT) * scale
  )

  ctx.restore()
}

/**
 * Draws labels.
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawLabels (
  ctx: Canvas.SKRSContext2D,
  streetData: Street,
  groundLevel: number,
  offsetLeft: number,
  scale: number
): void {
  const street = streetData.data.street

  ctx.save()

  ctx.lineWidth = 0.25 * scale

  ctx.font = `normal ${LABEL_FONT_WEIGHT} ${LABEL_FONT_SIZE * scale}px ${LABEL_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'

  street.segments.forEach((slice, i) => {
    const availableWidth = slice.width * TILE_SIZE

    let left = offsetLeft

    if (i === 0) {
      left--
    }

    // Left line
    drawLine(
      ctx,
      left,
      groundLevel + GROUND_BASELINE_HEIGHT,
      left,
      groundLevel + 125,
      scale
    )

    const x = offsetLeft + availableWidth / 2

    // Width label
    const text = prettifyWidth(slice.width, street.units)
    ctx.fillText(text, x * scale, (groundLevel + 60) * scale)

    // Segment name label
    const name = slice.label ?? getSliceName(slice.type, slice.variantString)
    const nameWidth = ctx.measureText(name).width / scale

    if (nameWidth <= availableWidth - 10) {
      ctx.fillText(name, x * scale, (groundLevel + 83) * scale)
    }

    offsetLeft += availableWidth
  })

  // Final right-hand side line
  const left = offsetLeft + 1
  drawLine(
    ctx,
    left,
    groundLevel + GROUND_BASELINE_HEIGHT,
    left,
    groundLevel + 125,
    scale
  )

  ctx.restore()
}

export function drawLine (
  ctx: Canvas.SKRSContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number
): void {
  x1 *= scale
  y1 *= scale
  x2 *= scale
  y2 *= scale

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

/**
 * Ported from client, but this has never been used
 */
export function drawArrowLine (
  ctx: Canvas.SKRSContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number,
  text?: string
): void {
  x1 += 2
  x2 -= 2

  drawLine(ctx, x1, y1, x2, y2, scale)

  if (text) {
    ctx.save()
    ctx.font = 12 * scale + 'px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, ((x1 + x2) / 2) * scale, y1 * scale - 10)
    ctx.restore()
  }
}

const SLICE_UNKNOWN = {
  unknown: true,
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {}
}

export const SLICE_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing'
  }
}

function getSliceName (type: string, variant: string): string {
  const sliceInfo = getSliceInfo(type)
  const variantInfo = getSliceVariantInfo(type, variant)
  const defaultName = variantInfo.name ?? sliceInfo.name
  return defaultName
}

function getSliceInfo (type: string): unknown {
  return SLICE_LOOKUP[type] ?? SLICE_UNKNOWN
}

function getSliceVariant (type: string, variant: string): unknown {
  return SLICE_LOOKUP[type]?.details?.[variant]
}

function applySliceInfoOverridesAndRules (details, sliceRules): unknown {
  const { rules, ...overrides } = details
  return Object.assign({}, sliceRules, rules, overrides)
}

function getSliceVariantInfo (type: string, variant: string): unknown {
  const sliceVariant = getSliceVariant(type, variant)
  const { rules } = getSliceInfo(type)

  if (sliceVariant?.components === undefined) {
    return SLICE_UNKNOWN_VARIANT
  }

  const { components, ...details } = sliceVariant
  const variantInfo = applySliceInfoOverridesAndRules(details, rules)

  // TODO: Bring the following back when we need slice info.
  // variantInfo.graphics = getSliceSprites(components)

  // // Assuming a slice has one "lane" component, a slice's elevation can be found using the id
  // // of the first item in the "lane" component group.
  // const lane = getSliceComponentInfo(
  //   COMPONENT_GROUPS.LANES,
  //   components.lanes[0].id
  // )
  // variantInfo.elevation = lane.elevation

  return variantInfo
}
