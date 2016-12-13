const path = require("path");
const webpack = require("webpack");
const HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'app');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');
const TEM_PATH = path.resolve(APP_PATH, 'templates');

module.exports = {

  entry: {
    app: path.resolve(APP_PATH, "app.js")
  },

  output: {
    path: BUILD_PATH,
    filename: "bundle.js"
  },

  // devtool: 'eval-source-map',

  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
    // proxy: {
    //   '/api/*': {
    //       target: 'http://localhost:5000',
    //       secure: false
    //   }
    // }
  },

  module: {

    perLoaders: [
      {
        test: /\.jsx?$/,
        include: APP_PATH,
        loader: 'jshint-loader'
      }
    ],

    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: APP_PATH
      },
      {
        test: /\.css$/,
        loader: ExtractTextWebpackPlugin.extract("style-loader", "css-loader")
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'sass'],
        include: APP_PATH
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=40000'
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url'
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        loader: 'file'
      }
    ]
},

  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ],

  jshint: {
    "esnext": true
  },

  resolve: {
    extensions: ["", ".js", ".jsx"]
  },

  plugins: [

    // new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new HtmlwebpackPlugin({
      template: path.resolve(APP_PATH, "index.html"),
      inject: "body"
    }),

    new ExtractTextWebpackPlugin('style.css')
  ]
};