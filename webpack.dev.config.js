'use strict'

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: '[name].css'
})

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  entry: [
    path.join(__dirname, './assets/app.js')
  ],
  output: {
    path: '/',
    filename: '[name].js'
  },
  plugins: [
    extractSass,
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.scss|sass$/,
        use: extractSass.extract({
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true }
            },
            'postcss-loader',
            'sass-loader'
          ],
          fallback: 'style-loader'
        })
      }
    ]
  }
}
