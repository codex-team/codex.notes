/**
 * Bundle config
 */
let webpack           = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let path              = require('path');

require('dotenv').config();

/**
 * Configure plugins
 * @type {Array}
 */
let plugins = [
  /** Block build if errors found */
  new webpack.NoEmitOnErrorsPlugin(),
  /** Extract CSS bundle */
  new ExtractTextPlugin('public/build/bundle.css'),
];

/** CSS and JS minification */
if (process.env.DEBUG !== 'true'){
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}


module.exports = {

  entry: './public/javascripts/app.js',

  output: {
    filename: './public/build/bundle.js',
    library: ['codex', 'notes']
  },

  target: 'electron',

  module: {
    rules: [
      {
        test : /\.(png|jpg|svg)$/,
        use : 'file-loader?name=[path][name].[ext]'
      },
      {
        /**
         * Use for all CSS files loaders below
         * - extract-text-webpack-plugin
         * - postcss-loader
         */
        test: /\.css$/,
        /** extract-text-webpack-plugin */
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              minimize: process.env.DEBUG !== 'true' ? 1 : 0,
              importLoaders: 1
            }
          },
          /** postcss-loader */
          'postcss-loader'
        ])
      },
      {
        /**
         * Use for all JS files loaders below
         * - babel-loader
         * - eslint-loader
         */
        test: /\.js$/,
        exclude : /node_modules/,
        use : [
          /** Babel loader */
          {
            loader: 'babel-loader',
            options: {
              presets: [ 'env' ]
            },
          },
          /** ES lint For webpack build */
          {
            loader: 'eslint-loader',
            options: {
              fix: true,
              sourceType: 'module'
            }
          }
        ]
      }
    ]
  },

  /**
   * Add plugins
   */
  plugins,

  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)

    modules: [
      'node_modules',
      path.resolve(__dirname, 'public/')
    ],
    // directories where to look for modules

    extensions: ['.js', '.json', '.jsx', '.css'],
    // extensions that are used

    alias: {
      // a list of module name aliases

      'module': 'new-module',
      // alias "module" -> "new-module" and "module/path/file" -> "new-module/path/file"

      'only-module$': 'new-module',
      // alias "only-module" -> "new-module", but not "module/path/file" -> "new-module/path/file"

      // alias "module" -> "./app/third/module.js" and "module/file" results in error
      // modules aliases are imported relative to the current context
    },
    /* alternative alias syntax (click to show) */

    /* Advanced resolve configuration (click to show) */
  },

  performance: {
    hints: 'warning', // enum
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
    assetFilter: function (assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },

  devtool: 'source-map',

  /** Пересборка при изменениях */
  watch: true,
  watchOptions: {

    /** Таймаут перед пересборкой */
    aggragateTimeout: 50
  }
};
