const TerserPlugin = require('terser-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const { WPCONST } = require('./_const');

const optimization = {
  namedModules: true,
  noEmitOnErrors: true,
  runtimeChunk: {
    name: 'manifest',
  },
  // concatenateModules: true,
};

optimization.splitChunks = {
  chunks: 'all',
  minSize: 100000,
  // minChunks: 2,
  // maxAsyncRequests: 5,
  // maxInitialRequests: 3,
  // automaticNameDelimiter: '~',
  automaticNameMaxLength: 30,
  name: true,
  cacheGroups: {
    REACT: {
      name: 'react',
      test: /[\\/](react|react-dom|react-router)/,
      chunks: 'initial',
      priority: 95,
      reuseExistingChunk: true,
      enforce: true,
    },
    ANTD: {
      name: 'antd',
      test: /[\\/](@ant-design|antd)/,
      chunks: 'initial',
      priority: 90,
      reuseExistingChunk: true,
      enforce: true,
    },
    ANTD_EXT: {
      name: 'antd-ext',
      test: /[\\/](rc-*|tinycolor2)/,
      chunks: 'initial',
      priority: 89,
      reuseExistingChunk: true,
      enforce: true,
    },
    LIBS: {
      name: 'libs',
      test: /[\\/]node_modules[\\/](mobx|redux|axios|i18next)/,
      chunks: 'initial',
      priority: 40,
      reuseExistingChunk: true,
      enforce: true,
    },
    VENDORS: {
      name: 'vendors',
      test: /[\\/]node_modules[\\/]/,
      chunks: 'initial',
      priority: 10,
      reuseExistingChunk: true,
      enforce: true,
    },
    // G: {
    //   chunks: 'async',
    //   minChunks: 2,
    //   minSize: 100000,
    //   priority: 1,
    //   reuseExistingChunk: true,
    //   enforce: true,
    // },
  },
};

if (WPCONST.__DEV__) {
  //
  // DEV PLUGIN
  //
  optimization.minimize = false;
  optimization.minimizer = [];
} else {
  //
  // PROD PLUGIN
  //
  optimization.minimize = true;
  optimization.minimizer = [
    new TerserPlugin({
      parallel: true,
      cache: true,
      // exclude: /\/(monaco|codemirror)/,
      extractComments: false,
      sourceMap: false,
      terserOptions: {
        parse: {
          // We want terser to parse ecma 8 code. However, we don't want it
          // to apply any minification steps that turns valid ecma 5 code
          // into invalid ecma 5 code. This is why the 'compress' and 'output'
          // sections only apply transformations that are ecma 5 safe
          // https://github.com/facebook/create-react-app/pull/4234
          ecma: 8,
        },
        compress: {
          ecma: 5,
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebook/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
          // Disabled because of an issue with Terser breaking valid code:
          // https://github.com/facebook/create-react-app/issues/5250
          // Pending further investigation:
          // https://github.com/terser-js/terser/issues/120
          inline: 2,
        },
        mangle: {
          safari10: true,
        },
        // Added for profiling in devtools
        keep_classnames: undefined,
        keep_fnames: false,
        output: {
          ecma: 5,
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebook/create-react-app/issues/2488
          ascii_only: true,
        },
      },
    }),
    new OptimizeCSSAssetsPlugin({
      parser: safePostCssParser,
      assetNameRegExp: /\.css\.*(?!.*map)/g,
      cssProcessorOptions: {
        reduceIdents: false, // https://github.com/ben-eb/cssnano/issues/247
        mergeLonghand: false,
        discardComments: { removeAll: true },
        safe: true,
        autoprefixer: { disable: true },
      },
      cssProcessorPluginOptions: {
        preset: ['default', { minifyFontValues: { removeQuotes: false } }],
      },
      canPrint: true,
    }),
  ];

  // optimization.minimize = false;
  // optimization.minimizer = [];
}

module.exports = { optimization };
