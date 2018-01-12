'use strict'

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: 'styles.css',
  allChunks: true
})

module.exports = {
  target: 'web',
  entry: [
    path.resolve(__dirname, './assets/app.js')
  ],
  output: {
    path: path.resolve(__dirname, './assets/build'),
    publicPath: '/assets/build',
    filename: '[name].js'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', '.css', '.scss']
  },
  plugins: [
    extractSass,
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
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
              options: { minimize: false }
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
