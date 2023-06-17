import { URLSearchParams } from 'node:url'
import { rest } from 'msw'
import autocompleteResponse from '../fixtures/geocode/autocomplete.json'
import searchResponse from '../fixtures/geocode/search.json'

export const handlers = [
  rest.get('/api/v1/flags', (req, res, ctx) => {
    return res(ctx.status(200))
  }),

  rest.get('api/v1/users/:userId', (req, res, ctx) => {
    const { userId } = req.params

    // If provided with this user id, create a mock server error
    // The actual error code does not matter
    if (userId === 'error_user') {
      return res(ctx.status(403))
    }

    // In all other cases, return a mock user with the provided user id
    return res(
      ctx.status(200),
      ctx.json({
        id: userId,
        displayName: `It's me, ${userId}!`,
        // Test image is from here: https://opengameart.org/content/cute-retro-pixel-penguin-16x16
        profileImageUrl:
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIABAAEAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP62f+Chv/BQDUf2LdO+Evgn4U/ALxB+1P8AtR/tC+ILrRvgh8C7Lx/4V+BngvVtO8P+Kvhx4R8X+LPih+0f8TLdvhT8HPD9t4p+Lnwr+F3gG28ST3vir4v/AB9+MHwb+C/w88Naxrnjq41Pw6AH/BPL/goBqP7aWnfFrwT8VvgF4g/ZY/aj/Z68QWujfG/4F3vj/wAK/HPwXpOneIPFXxH8I+EPFnwv/aP+Gduvwp+Mfh+58U/CP4qfC7x9beG57LxV8IPj78H/AIyfBf4h+GtH1zwLb6n4iAPjDxp4Nm8Bf8FWv2svjV/wUe1DSpf2N/E37Kvweg/YE+NvxA+IOjeDf2Zv2XdK+GXjn4XeOv2o/hh45v8AWPEvgbQvhp+1h8QP2lfCPwF/ae+DXxP1DQ/Enj3U/BfwNsdX+GXxu8OXPwB1XwJ4M8fOsVk9PCwy7Oc0o5XT4grSyDBN5xUyPHY7HZhhcS4YDJsfhsXgcxp5xUw1HFV8G8pxNLNKP1episHOnUw/tae+HjXU3XoUXVeEUcTUvh44mjThCrTiqmJpVKdSjKg6s6VOaxEJUZyqRpTUlUUZHgvwbN49/wCCrX7Jvxq/4Jw6hpUX7G/hn9lX4wwft9/G34f/ABB0bxl+zN+1FpXxN8c/FHx1+y58MPA1/o/iXxzoXxL/AGsPh/8AtK+Lvj1+098Zfifp+h+G/HumeC/jlfav8Tfjd4jufj9pXgTxmZLisnqYWeXZNmlHNKfD9aOQY1rOKmeY7A47L8LhnPAZzj8Ti8dmNTOKeGrYWvjHm2Jq5pW+sU8VjJ1KmI9rUMRGu5qvXouk8WpYmnbDxw1GpCdWpF1MNSp06dGNBVYVacFh4RowlTlSgoqm4x//2Q==',
        flags: {},
        roles: ['USER'],
        data: {}
      })
    )
  }),

  // EXTERNAL REQUESTS
  rest.post(
    'https://buttondown.email/api/emails/embed-subscribe/streetmix',
    async (req, res, ctx) => {
      // Read submitted email address and conditionally respond
      const text = await req.text()
      const params = new URLSearchParams(text)

      // Mock response with a 500 error
      if (params.get('email') === 'error_500@foo.com') {
        return res(ctx.status(500))
      }

      // Mock response for miscellaneous failure
      if (params.get('email') === 'error_client@foo.com') {
        return res(ctx.status(404))
      }

      // Mocks a success response with a "realistic" server delay
      if (params.get('email') === 'test_pending@example.com') {
        return res(ctx.delay(), ctx.status(200))
      }

      // Success response
      return res(ctx.status(200))
    }
  ),

  rest.get('https://api.geocode.earth/v1/autocomplete', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(autocompleteResponse))
  }),

  rest.get('https://api.geocode.earth/v1/search', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(searchResponse))
  })
]
