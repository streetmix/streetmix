// Output using cmap2file as per
// http://www.typophile.com/node/64147#comment-380776

const STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−'

export function needsUnicodeFont (str) {
  if (typeof str !== 'string') {
    return false
  }

  let needUnicodeFont = false

  for (let character of str) {
    if (STREET_NAME_FONT_GLYPHS.indexOf(character) === -1) {
      needUnicodeFont = true
      break
    }
  }

  return needUnicodeFont
}
