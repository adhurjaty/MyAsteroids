import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin'

export default  {
  entry: './src/app.js',
  output: {
    path: '/',
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
        {
            use: 'babel-loader',
            test: /\.js$/,
            exclude: /node_modules/
        },
        {
            use: ['style-loader', 'css-loader'],
            test: /\.css$/
        }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html'
    }),
    new LiveReloadPlugin()
  ]
};