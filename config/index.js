import path from "path";

const config = {
  projectName: 'yingooShop',
  date: '2020-10-19',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2,
    '375': 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  babel: {
    sourceMap: true,
    presets: [
      ['env', {
        modules: false
      }]
    ],
    plugins: [
      'transform-decorators-legacy',
      'transform-class-properties',
      'transform-object-rest-spread',
      ['transform-runtime', {
          helpers: false,
          polyfill: false,
          regenerator: true,
          moduleName: 'babel-runtime'
        }
      ]
    ]
  },
  plugins: [
    '@tarojs/plugin-sass',
    '@tarojs/plugin-less',
    '@tarojs/plugin-terser'
  ],
  framework: 'react',
  defineConstants: {
  },
  mini: {
    webpackChain(chain, webpack) {
      chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, []);
      //使用ContextReplacementPlugin将moment.locale当中除了zh-cn的语言包,其余都剔除掉
      chain.plugin('contextReplace').use(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/), []);
      chain.optimization.sideEffects(false);
      chain.optimization.minimize(true);
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          browsers: [
            'last 3 versions',
            'Android >= 4.1',
            'ios >= 8'
          ]
        }
      },
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 10240 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    compile: {
        exclude: [
            // path.resolve(__dirname, '..', 'src/pages/editor/shell.js'),
            // path.resolve(__dirname, '..', 'src/pages/editor/eshell/shelltools.js'),
        ]
    }
  },
  h5: {
    router: {
      mode: 'browser',
      customRoutes: {
        '/pages/index/index': '/',
        '/pages/template/index': '/template',
        '/pages/template/detail': '/template/detail',
        '/pages/editor/shell': '/editor/shell',
        '/pages/editor/index': '/editor/shell',
        // '/pages/editor/photos': '/editor/photos',
        // '/pages/editor/pillow': '/editor/pillow',
        // '/pages/editor/mousepad': '/editor/mousepad',
        '/pages/tabbar/me/me':'/me',
        '/pages/search/index': "/search"
      }
    },
    publicPath: '/',
    staticDirectory: 'static',
    output: {
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/[name].[chunkhash].js'
    },
    miniCssExtractPluginOption: {
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[chunkhash].css',
    },
    esnextModules: ['taro-ui'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          browsers: [
            'last 3 versions',
            'Android >= 4.4',
            'ios >= 9'
          ]
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
