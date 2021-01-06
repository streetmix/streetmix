const { User } = require('../../db/models')
const faker = require('faker')

/*
a factory to make a user
by default it generates fake data, but you can pass in other props too
*/
const user = async (props = {}) => {
  const defaultProps = {
    id: faker.internet.userName(),
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date()
  }
  return Object.assign({}, defaultProps, props)
}

export default async (props = {}) => User.create(await user(props))
