// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import SLICE_LOOKUP from '@streetmix/parts/src/data/segment-lookup.json' with { type: 'json' }
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'
import { prettifyWidth } from './dimensions.js'
import { getTranslations } from './locale.js'

import type * as Canvas from '@napi-rs/canvas'
import type { StreetJson } from '@streetmix/types'

const LABEL_BACKGROUND = 'rgb(216, 211, 203)'
const LABEL_FONT = 'Geist Sans'
const LABEL_FONT_CLIENT = 'Rubik Variable'
const LABEL_FONT_SIZE = 12
const LABEL_FONT_WEIGHT = '400'

/**
 * Draws slice label background.
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawLabelBackground(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
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
export async function drawLabels(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  street: StreetJson, // street data
  groundLevel: number,
  offsetLeft: number,
  scale: number,
  locale: string, // locale to render labels in
  // This is an optional slice name lookup function that the client passes
  // in because we have to use their lookup function rather than the server one
  getSliceNameFn?: (
    type: string,
    variantString: string,
    locale: string
  ) => Promise<string> | string
): Promise<void> {
  ctx.save()

  // Use Rubik Variable in the client, and Geist Sans in the backend
  // Variable fonts are not well supported in @napi-rs/canvas last I checked
  // so a replacement font is being used
  const font = typeof window === 'undefined' ? LABEL_FONT : LABEL_FONT_CLIENT

  ctx.lineWidth = 0.25 * scale
  ctx.font = `normal ${LABEL_FONT_WEIGHT} ${LABEL_FONT_SIZE * scale}px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'

  let isFirst = true

  // This loop needs to run in sequence but getSliceName does an async import
  // on translation files so we use for...of instead of forEach
  for (const slice of street.segments) {
    const availableWidth = slice.width * TILE_SIZE

    let left = offsetLeft

    if (isFirst) {
      left--
      isFirst = false
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
    const text = prettifyWidth(slice.width, street.units, locale)
    ctx.fillText(text, x * scale, (groundLevel + 60) * scale)

    // Segment name label
    const name =
      slice.label ??
      (await (getSliceNameFn ?? getSliceName)(
        slice.type,
        slice.variantString,
        locale
      ))
    const nameWidth = ctx.measureText(name).width / scale

    if (nameWidth <= availableWidth - 10) {
      ctx.fillText(name, x * scale, (groundLevel + 83) * scale)
    }

    offsetLeft += availableWidth
  }

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

export function drawLine(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
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
export function drawArrowLine(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
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
  details: {},
}

export const SLICE_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing',
  },
}

async function getSliceName(
  type: string,
  variant: string,
  locale: string
): Promise<string> {
  const sliceInfo = getSliceInfo(type)
  const variantInfo = getSliceVariantInfo(type, variant)
  const defaultName = variantInfo.name ?? sliceInfo.name
  const nameKey = variantInfo.nameKey ?? sliceInfo.nameKey

  const translations = await getTranslations(locale, 'segment-info')
  return translations.segments[nameKey] ?? defaultName
}

function getSliceInfo(type: string): unknown {
  return SLICE_LOOKUP[type] ?? SLICE_UNKNOWN
}

function getSliceVariant(type: string, variant: string): unknown {
  return SLICE_LOOKUP[type]?.details?.[variant]
}

function applySliceInfoOverridesAndRules(details, sliceRules): unknown {
  const { rules, ...overrides } = details
  return Object.assign({}, sliceRules, rules, overrides)
}

function getSliceVariantInfo(type: string, variant: string): unknown {
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
