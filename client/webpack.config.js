require('dotenv').config();
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEV = process.env.NODE_ENV === 'dev';
const PROD = process.env.NODE_ENV === 'prod';

const entry = [path.resolve(__dirname, 'src/index.tsx')];
const outputFileName = DEV? 'bundle.js': 'bundle-[hash].js';
const vendorFileName = DEV? 'vendor-bundle.js': 'vendor-bundle-[hash].js';

const webpackConfig = {
  entry,

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFileName,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: ['react-hot-loader', 'ts-loader?silent=true'],
      },
    ],
  },

  resolve: {
    extensions: ['*', '.js', 'jsx', '.ts', '.tsx'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Cognito React - Coding Sans',
      template: 'src/indexTemplate.ejs',
      inject: 'body',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: vendorFileName,
    }),
    new webpack.DefinePlugin({
      LAMBDA_API: JSON.stringify(process.env.LAMBDA_API),
    }),
  ],
};

if (DEV) {
  webpackConfig.devtool = "source-map";
  webpackConfig.module.rules.unshift({
    enforce: 'pre', test: /\.js$/, loader: "source-map-loader"
  });
  webpackConfig.devServer = {
    contentBase: './dist',
    hot: true,
    hotOnly: true,
    inline: true,
  };
  webpackConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin());
}

if (PROD) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
      mangle: {
        keep_fnames: true
      }
    })
  )
}

module.exports = webpackConfig;
