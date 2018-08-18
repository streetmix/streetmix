import {
  SHOW_GALLERY,
  HIDE_GALLERY,
  RECEIVE_GALLERY_STREETS,
  DELETE_GALLERY_STREET,
  SET_GALLERY_STATE } from '../actions'

export function showGallery (userId, mode) {
  return {
    type: SHOW_GALLERY,
    userId,
    mode
  }
}

export function hideGallery () {
  return { type: HIDE_GALLERY }
}

export function receiveGalleryStreets (streets) {
  return {
    type: RECEIVE_GALLERY_STREETS,
    streets
  }
}

export function deleteGalleryStreet (streetId) {
  return {
    type: DELETE_GALLERY_STREET,
    id: streetId
  }
}

export function setGalleryMode (mode) {
  return {
    type: SET_GALLERY_STATE,
    mode
  }
}

export function setGalleryUserId (userId) {
  return {
    type: SET_GALLERY_STATE,
    userId
  }
}
