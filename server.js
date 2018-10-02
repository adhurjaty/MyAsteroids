import express from 'express'; 
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.js';

const app = express();
app.use(webpackMiddleware(webpack(webpackConfig)));

// app.get('/', (req, res) => {
//     res.send('Hello World')
// })
app.listen(8000, function() {
  console.log('Listening');
});