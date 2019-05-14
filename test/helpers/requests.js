import moxios from 'moxios'

export const respondWith = (response) => {
  return new Promise((resolve, reject) => {
    moxios.wait(() => {
      moxios.requests.mostRecent().respondWith({
        status: 200,
        response
      }).then(resolve, reject)
    })
  })
}
