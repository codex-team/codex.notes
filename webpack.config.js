const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  /**
   * Define entry point
   */
  entry: path.resolve( __dirname, 'public', 'javascripts', 'app.js'),

  /**
   * Set bundle params
   */
  output: {
    path: path.resolve(__dirname, 'public', 'build'),
    filename: 'bundle.js',
    library: ['codex', 'notes']
  },

  target: 'electron-renderer',

  /**
   * Loaders are used to transform certain types of modules
   */
  module: {
    rules: [
      {
        test : /\.(png|jpg|svg)$/,
        use : 'file-loader?name=[path][name].[ext]'
      },
      /**
       * Process js files
       */
      {
        test: /\.js$/,
        exclude: [ /node_modules/ ],
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: [ 'env' ],
            },
          },
          {
            loader: 'eslint-loader',
            options: {
              fix: true,
            },
          },
        ]
      },

      /**
       * Process css files
       */
      {
        test: /\.css$/,
        exclude: [ /node_modules/ ],
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              minimize: 1,
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: __dirname + '/.postcssrc'
              }
            }
          }
        ]),
      }
    ]
  },

  /**
   * Adding plugins to configuration
   */
  plugins: [
    /** Build separated styles bundle */
    new ExtractTextPlugin('bundle.css'),
  ],

  /**
   * Rebuild bundles on files changes
   * Param --watch is a key for the command in the package.json scripts
   */
  watchOptions: {
    aggregateTimeout: 50,
  },

  /**
   * Optimization params
   */
  optimization: {
    noEmitOnErrors: true,
    splitChunks: false
  }
};