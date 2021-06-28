const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const fs = require('fs')

const resourceRetryScript = fs.readFileSync(
  require.resolve("@yuanfudao/resource-retry/dist/index.umd.min.js")
);

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'https://blocked.cdn.com/'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  optimization: {
    // minimize: false
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      template: '!!pug-loader!index.pug',
      templateParameters: { resourceRetryScript }
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/assets', to: '' }]
    })
  ]
}
