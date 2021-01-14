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
  it('adds admin to roles', async () => {
    // fyi: sequelize dosen't actually pass this to the table until user.save() or update
    // so...this isn't commiting to the database and isn't testing that the role actually exists
    user.addRole('ADMIN')
    expect(user.roles[1]).toBe('ADMIN')
    // we don't let dupe values be added
    user.addRole('ADMIN')
    expect(user.roles[2]).not.toBe('ADMIN')
  })
  it('removes admin from roles', async () => {
    user.removeRole('ADMIN')
    expect(user.roles[1]).not.toBe('ADMIN')
  })
  it('throws an error when role is invalid', async () => {
    // see https://jestjs.io/docs/en/expect#expectassertionsnumber
    // TODO: if the test says simple maybe we dont need the expect assertions
    // I don't want to include it unlesss we really need it
    expect.assertions(1)
    user.addRole('SPACE')
    // see https://jestjs.io/docs/en/tutorial-async#rejects
    await expect(user.validate()).rejects.toThrow(
      'Validation error: Role does not match list of valid roles'
    )
  })

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await User.sequelize.close()
  })
})
