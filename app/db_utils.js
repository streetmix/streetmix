const logger = require('../lib/logger.js')()

const combineWrites = (mainMethod, altMethod) => {
  return async function (req, res) {
    const resObject = { status: 200 }
    // alt
    const alternateResponse = {}
    alternateResponse.header = () => alternateResponse
    alternateResponse.set = () => alternateResponse
    alternateResponse.end = () => alternateResponse
    alternateResponse.status = () => alternateResponse

    // main
    const mainResponse = {}
    mainResponse.header = () => mainResponse
    mainResponse.set = (foo, bar) => {
      res.set(foo, bar)
      return mainResponse
    }
    mainResponse.status = (e) => {
      resObject.status = e
      return mainResponse
    }
    mainResponse.json = (mainData) => {
      alternateResponse.mainData = mainData
      alternateResponse.json = (altData) => {
        const comparify = (data) => {
          data.createdAt = ''
          data.updatedAt = ''

          const cleaned = {}
          Object.keys(data)
            .sort()
            .forEach((item) => {
              if (
                data[item] &&
                data[item] !== null &&
                Object.entries(data[item]).length !== 0
              ) {
                cleaned[item] = data[item]
              }
            })
          return JSON.stringify(cleaned, Object.keys(cleaned).sort())
        }
        // if resulting objects are unequal, log an alarm
        if (comparify(mainData) !== comparify(altData)) {
          logger.error(
            `main/alt response for ${req.method} ${req.url} DIFFER: \n ${JSON.stringify({
              m: comparify(mainData),
              a: comparify(altData)
            })}`
          )
        }

        return res
          .status(mainData.status || 200)
          .json(mainData)
          .end()

        // return alternateResponse
      }
      alternateResponse.json.bind(this)
      alternateResponse.send = alternateResponse.json
      alternateResponse.end = () => alternateResponse.json(resObject)
      altMethod(req, alternateResponse)

      return mainResponse
    }
    mainResponse.json.bind(this)
    mainResponse.send = mainResponse.json
    mainResponse.end = () => mainResponse.json(resObject)
    mainMethod(req, mainResponse)
  }
}

module.exports = {
  combineReads: combineWrites, // todo add read or write specific switches
  combineWrites
}
