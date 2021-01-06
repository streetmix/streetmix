/* eslint-disable no-undef */
import userFactory from '../../factories/user.js'
const { User } = require('../../models')

describe('creates a user', () => {
  let user

  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  // note: we may not need the pretest hooks if we do it this way?
  beforeAll(async () => {
    await User.sequelize.sync({ force: true })
  })

  beforeEach(async () => {
    user = await userFactory()
  })
  it('created user to match', async () => {
    user = await userFactory({ id: 'thefirstuser' })
    expect(user.id).toBe('thefirstuser')
  })
  it('has a default role of USER', async () => {
    expect(user.roles[0]).toBe('USER')
  })
  it('adds admin to role', async () => {
    user.roles.push('ADMIN')
    expect(user.roles[1]).toBe('ADMIN')
  })

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await User.sequelize.close()
  })
})
