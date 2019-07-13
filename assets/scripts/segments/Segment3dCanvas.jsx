import React, { Component } from 'react'
import * as THREE from 'three'
import ColladaLoader from '../util/collada_loader'

class ThreeScene extends Component {
  componentDidMount () {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    this.loadCollada = this.loadCollada.bind(this)
    // ADD SCENE
    this.scene = new THREE.Scene()
    // ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.z = 4
    // ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(0xffffff, 0)
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)
    // ADD CUBE
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: '#433F81' })
    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)
    this.start()

    // var dae // graphic
    this.loader = new ColladaLoader() // loader
    // do we need to bind this.loadCollada here?
    this.loader.load('../images/car.dae', this.loadCollada)
  }
  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }
start = () => {
  if (!this.frameId) {
    this.frameId = requestAnimationFrame(this.animate)
  }
}
stop = () => {
  cancelAnimationFrame(this.frameId)
}
loadCollada = (collada, err) => {
  console.log({ collada, err })
  const dae = collada.scene
  this.scene.add(dae)
}
animate = () => {
  this.cube.rotation.x += 0.01
  this.cube.rotation.y += 0.01
  this.renderScene()
  this.frameId = window.requestAnimationFrame(this.animate)
}
renderScene = () => {
  this.renderer.render(this.scene, this.camera)
}
render () {
  return (
    <div
      className="3d-mount"
      style={{ width: '100px', height: '100px', marginTop: '500px' }}
      ref={(mount) => { this.mount = mount }}
    />
  )
}
}
export default ThreeScene
