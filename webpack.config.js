const path = require('path')
// const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './src/merkling.js',
  output: {
    filename: 'merkling.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      root: 'Merkling',
      amd: 'merkling',
      commonjs: 'merkling'
    },
    libraryTarget: 'umd'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    // new CleanWebpackPlugin(['dist'])
  ],
  externals: {
    ipfs: {
      commonjs: 'ipfs',
      commonjs2: 'ipfs',
      amd: 'ipfs',
      root: 'IPFS'
    }
  }
}
