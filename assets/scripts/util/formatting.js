const FormatNumber = (locale, number) => {
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }).format(number)
}

module.exports = {
  FormatNumber
}
