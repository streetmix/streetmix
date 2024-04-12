import { runTestCanvas } from '@streetmix/export-image'

export async function get (req, res) {
  const image = await runTestCanvas()

  res.set('Content-Type', 'image/png')
  res.status(200).send(image)
}
