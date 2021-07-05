const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const fs = require('fs')

const resourceRetryScript = fs.readFileSync(
  // require.resolve("@yuanfudao/resource-retry/dist/index.umd.min.js")
  path.resolve(__dirname, '../dist/index.umd.min.js')
)

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      publicPath: 'http://blocked.cdn.com/',
      template: `!!pug-loader!${path.resolve(__dirname, 'index.pug')}`,
      templateParameters: { resourceRetryScript }
    }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, 'src/assets'), to: '' }]
    })
  ],
  optimization: {
    minimize: false
  },
  devServer: {
    disableHostCheck: true
  }
}
