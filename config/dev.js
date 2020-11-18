module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {},
  h5: {
    devServer: {
      port: 80,
      proxy: {
        '/api/': {
          target: "http://192.168.0.166",
          changeOrigin: true
        }
      }
    }
  } 
}