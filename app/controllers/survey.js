const { generateRandomBallotFetch } = require('../resources/v1/votes')

exports.get = generateRandomBallotFetch({ redirect: true })
