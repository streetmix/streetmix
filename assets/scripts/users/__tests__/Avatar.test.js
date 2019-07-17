/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithRedux } from '../../../../test/helpers/render'
import Avatar from '../Avatar'

describe('Avatar', () => {
  afterEach(cleanup)

  it('shows avatar image', () => {
    // Test image is from here: https://opengameart.org/content/cute-retro-pixel-penguin-16x16
    const image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIABAAEAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP62f+Chv/BQDUf2LdO+Evgn4U/ALxB+1P8AtR/tC+ILrRvgh8C7Lx/4V+BngvVtO8P+Kvhx4R8X+LPih+0f8TLdvhT8HPD9t4p+Lnwr+F3gG28ST3vir4v/AB9+MHwb+C/w88Naxrnjq41Pw6AH/BPL/goBqP7aWnfFrwT8VvgF4g/ZY/aj/Z68QWujfG/4F3vj/wAK/HPwXpOneIPFXxH8I+EPFnwv/aP+Gduvwp+Mfh+58U/CP4qfC7x9beG57LxV8IPj78H/AIyfBf4h+GtH1zwLb6n4iAPjDxp4Nm8Bf8FWv2svjV/wUe1DSpf2N/E37Kvweg/YE+NvxA+IOjeDf2Zv2XdK+GXjn4XeOv2o/hh45v8AWPEvgbQvhp+1h8QP2lfCPwF/ae+DXxP1DQ/Enj3U/BfwNsdX+GXxu8OXPwB1XwJ4M8fOsVk9PCwy7Oc0o5XT4grSyDBN5xUyPHY7HZhhcS4YDJsfhsXgcxp5xUw1HFV8G8pxNLNKP1episHOnUw/tae+HjXU3XoUXVeEUcTUvh44mjThCrTiqmJpVKdSjKg6s6VOaxEJUZyqRpTUlUUZHgvwbN49/wCCrX7Jvxq/4Jw6hpUX7G/hn9lX4wwft9/G34f/ABB0bxl+zN+1FpXxN8c/FHx1+y58MPA1/o/iXxzoXxL/AGsPh/8AtK+Lvj1+098Zfifp+h+G/HumeC/jlfav8Tfjd4jufj9pXgTxmZLisnqYWeXZNmlHNKfD9aOQY1rOKmeY7A47L8LhnPAZzj8Ti8dmNTOKeGrYWvjHm2Jq5pW+sU8VjJ1KmI9rUMRGu5qvXouk8WpYmnbDxw1GpCdWpF1MNSp06dGNBVYVacFh4RowlTlSgoqm4x//2Q=='
    const userId = 'foo'
    const initialState = {
      user: {
        profileCache: {
          [userId]: {
            profileImageUrl: image
          }
        }
      }
    }

    // TODO: Mock fetch request for image.

    const { getByAltText } = renderWithRedux(<Avatar userId={userId} />, { initialState })
    const el = getByAltText(userId)

    // Expect image element to have set the correct source URL
    expect(el.src).toEqual(image)
  })

  it('shows no source image if the avatar image is not a valid image file', () => {
    const userId = 'bar'
    const { getByAltText } = renderWithRedux(<Avatar userId={userId} />)
    const el = getByAltText(userId)

    // Expect image element to have empty `src`
    // TODO: How to test placeholder image displayed with CSS?
    expect(el.src).toEqual('')
  })

  it.skip('shows a placeholder image if the avatar image fails to fetch', () => {
    // TODO: Mock errored fetch request
  })
})
