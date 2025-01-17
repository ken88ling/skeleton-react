const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const NodeEnv = process.env.NODE_ENV || 'development'
const isDevMode = NodeEnv === 'development'
const CdnUrl = process.env.CDN_URL || '/'
const AssetVersion = process.env.ASSET_VERSION || new Date().getTime()
const SentryDsn = 'https://1e2a7724377b4b8b833cc06028a3e5a2@sentry.io/1462882'

if (!(isDevMode || process.argv.includes('--json'))) {
  console.debug('--------------env--------------')
  console.debug('node env:', NodeEnv)
  console.debug('cdn url:', CdnUrl)
  console.debug('asset version:', AssetVersion)
  console.debug('sentry dsn:', SentryDsn)
  console.debug('--------------env--------------')
}

module.exports = {
  mode: NodeEnv,
  target: 'web',
  entry: {
    vendor: [
      'history',
      'immutable',
      'react-dom',
      'react-redux',
      'react-router-dom',
      'react',
      'redux-saga',
      'redux',
    ],
    main: './src/index.tsx'
  },
  output: {
    // publicPath: isDevMode ? '/' : `${CdnUrl}static/`,
    path: path.resolve(__dirname, 'dist/static'),
    filename: isDevMode ? '[name]-[hash:7].js' : '[name]-[contenthash:7].js'
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        include: path.resolve(__dirname, './src'),
        use: 'babel-loader?cacheDirectory'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    // for moment locale, please refer to https://github.com/moment/moment/tree/develop/locale
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb|zh-cn|zh-tw/),
    new webpack.DefinePlugin({
      CDN_URL: JSON.stringify(CdnUrl),
      ASSET_VERSION: JSON.stringify(AssetVersion),
      DEV_MODE: isDevMode,
      SENTRY_DSN: JSON.stringify(SentryDsn)
    }),
    new MiniCssExtractPlugin({
      filename: isDevMode ? '[name].css' : '[name]-[contenthash:7].css'
      // chunkFilename: isDevMode ? '[id].css' : '[name]-[contenthash:7].css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }]
      },
      canPrint: true
    }),
    new HtmlWebpackPlugin({
      inject: true,
      templateParameters: {
        cdn_url: CdnUrl,
        asset_version: AssetVersion,
        sentry_sdk: SentryDsn ? '<script src="https://browser.sentry-cdn.com/5.2.1/bundle.min.js" crossorigin="anonymous"></script>' : ''
      },
      template: path.resolve(__dirname, './src/template.html'),
      filename: isDevMode ? './index.html' : '../index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        minifyJS: true,
        minifyCSS: true
      }
    })
  ],
  devtool: isDevMode ? 'cheap-module-source-map' : 'none',
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /vendor/,
          chunks: 'all',
          enforce: true
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'public/'),
    port: 9003,
    compress: true,
    stats: {
      all: false,
      warnings: true,
      errors: true
    },
    historyApiFallback: true
  }
}
