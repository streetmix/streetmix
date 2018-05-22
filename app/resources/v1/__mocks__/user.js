/* eslint-env jest */
import mockingoose from 'mockingoose'

const _id = '5b031f6e914c751af47f2002'
// const userDummy = {
//   login_tokens: [ '133e5110-5d2e-11e8-a8fd-678b57961690',],
//   _id: '5b031f6e914c751af47f2002',
//   id: 'oluwaseun',
//   twitter_id: '43823232',
//   twitter_credentials:{
//     access_token_key: '463572291-Hve88xfj0hRYErbzAsfgsiosdfsoafsoafedfd',
//     access_token_secret: 'WoZytO4EklMe80uoVS8mGJntyeeqskMLuafdafjdafja'
//   },
//   updated_at: '2018-05-22T14:18:09.853Z',
//   created_at: '2018-05-21T19:35:10.807Z'
// }

module.exports = function () {
  return {
    save: function (_doc) {
      mockingoose.User.toReturn({..._doc, _id}, 'save')
    }
  }

  // findOne: function (id) {

  // }
}
