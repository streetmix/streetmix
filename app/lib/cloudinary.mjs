import cloudinary from 'cloudinary'

export function initCloudinary () {
  cloudinary.config({
    cloud_name: 'streetmix',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}
