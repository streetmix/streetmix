import { generateRandomBallotFetch } from '../resources/v1/votes.ts'

export const get = generateRandomBallotFetch({ redirect: true })
