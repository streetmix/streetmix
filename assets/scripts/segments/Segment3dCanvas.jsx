import React, { Component } from 'react'
import * as THREE from 'three'
import ColladaLoader from '../util/collada_loader'
import PropTypes from 'prop-types'
const MODEL_SCALE = 0.5

class ThreeScene extends Component {
  static propTypes = {
    variantString: PropTypes.string.isRequired
  }
  componentDidMount () {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    this.loadCollada = this.loadCollada.bind(this)
    // ADD SCENE
    this.scene = new THREE.Scene()
    // ADD CAMERA
    var HEIGHT = 100
    var WIDTH = 100
    var nearPlane = 1
    var farPlane = 2000
    var Z_CLIPPING_PLANE = 300
    this.camera = new THREE.OrthographicCamera(
      WIDTH / -2,
      WIDTH / 2,
      HEIGHT / 2,
      HEIGHT / -2,
      nearPlane,
      farPlane
    )

    this.camera.position.x = 0 // Straight on view to start
    this.camera.position.y = 0
    this.camera.position.z = Z_CLIPPING_PLANE
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    // ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(0xffffff, 0)
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)
    this.loader = new ColladaLoader() // loader
    this.loader.options.convertUpAxis = true
    this.loader.load('/images/models/car.dae', this.loadCollada)
  }
  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.variantString !== this.props.variantString) {
      this.animate()
    }
  }

start = () => {
  if (!this.frameId) {
    this.frameId = requestAnimationFrame(this.animate)
  }
}
stop = () => {
  cancelAnimationFrame(this.frameId)
}
loadCollada = (result, err) => {
  console.log({ result, err })
  var collada = result.scene
  collada.scale.x = collada.scale.y = collada.scale.z = MODEL_SCALE
  collada.updateMatrix()
  this.car = collada
  this.scene.add(collada)
  var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1)
  this.scene.add(light)
  this.start()
}
animate = () => {
  console.log(this.props)
  if (this.car && this.car.rotation) {
    // convert to radians
    const radians = (parseInt(this.props.variantString, 10) * Math.PI) / 180
    console.log('HOW DO I ROTATE!?', this.props.variantString, radians)
    this.car.rotation.z = radians
    // this.car.rotation.y += 0.01
  }
  this.renderScene()
  // this.frameId = window.requestAnimationFrame(this.animate)
}
renderScene = () => {
  this.renderer.render(this.scene, this.camera)
}
render () {
  return (
    <div
      className="3d-mount"
      style={{ width: '225px', height: '225px', marginTop: '450px' }}
      ref={(mount) => { this.mount = mount }}
    />
  )
}
}
export default ThreeScene
