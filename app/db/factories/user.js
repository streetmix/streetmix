const { faker } = require('@faker-js/faker')
const { User } = require('../models/index.mjs')

/*
a factory to make a user
by default it generates fake data, but you can pass in other props too
*/
const user = (props = {}) => {
  const defaultProps = {
    id: faker.internet.userName(),
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date()
  }
  return Object.assign({}, defaultProps, props)
}

export default (props = {}) => User.create(user(props))
