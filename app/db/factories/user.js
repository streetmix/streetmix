import { faker } from '@faker-js/faker'
import User from '../models/user.js'

/*
a factory to make a user
by default it generates fake data, but you can pass in other props too
*/
const user = (props = {}) => {
  const defaultProps = {
    id: faker.internet.username(),
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date()
  }
  return Object.assign({}, defaultProps, props)
}

export default (props = {}) => User.create(user(props))
