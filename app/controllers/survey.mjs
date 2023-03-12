import { generateRandomBallotFetch } from '../resources/v1/votes.mjs'

export const get = generateRandomBallotFetch({ redirect: true })
