const path = require('path')
const { Parcel } = require('@parcel/core')

async function bundleProduction () {
  console.log('🛠️  Building a production bundle... ')

  const bundler = new Parcel({
    entries: path.join(process.cwd(), '/assets/scripts/main.js'),
    defaultConfig: '@parcel/config-default',
    mode: 'production'
  })

  try {
    const { bundleGraph, buildTime } = await bundler.run()
    const bundles = bundleGraph.getBundles()
    console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`)
  } catch (err) {
    console.log(err.diagnostics)
  }
}

async function bundleDevelopment () {
  console.log('🛠️  Building a development bundle... ')

  const bundler = new Parcel({
    entries: path.join(process.cwd(), '/assets/scripts/main.js'),
    defaultConfig: '@parcel/config-default',
    // serveOptions: {
    //   port: process.env.PORT
    // },
    hmrOptions: {
      port: process.env.PORT
    }
  })

  const subscription = await bundler.watch((err, event) => {
    if (err) {
      // fatal error
      throw err
    }

    if (event.type === 'buildSuccess') {
      const bundles = event.bundleGraph.getBundles()
      console.log(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`)
    } else if (event.type === 'buildFailure') {
      console.log(event.diagnostics)
    }
  })

  return subscription
}

module.exports = {
  bundleProduction,
  bundleDevelopment
}
