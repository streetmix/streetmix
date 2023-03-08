import { generateRandomBallotFetch } from '../resources/v1/votes.js'

export const get = generateRandomBallotFetch({ redirect: true })
