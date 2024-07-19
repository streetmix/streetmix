import { getStreetUrl } from './page_url'

describe('getStreetUrl', () => {
  it('returns a url for a user’s street', () => {
    const url = getStreetUrl({
      creatorId: 'foo',
      namespacedId: 1
    })
    expect(url).toBe('/foo/1')
  })

  it('returns a url for an anonymous user’s street', () => {
    const url = getStreetUrl({
      creatorId: null,
      namespacedId: 1000
    })
    expect(url).toBe('/-/1000')
  })

  it('returns a url for a user with a reserved name', () => {
    const url = getStreetUrl({
      creatorId: 'streets',
      namespacedId: 42
    })
    expect(url).toBe('/~streets/42')
  })

  it('returns a url with a slug when street is named', () => {
    const url = getStreetUrl({
      name: 'Street Name',
      creatorId: 'bar',
      namespacedId: 1337
    })
    expect(url).toBe('/bar/1337/street-name')
  })
})
