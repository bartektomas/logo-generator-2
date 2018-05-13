module.exports = {
  lintOnSave: true,

  devServer: {
    // https://alligator.io/vuejs/using-new-vue-cli-3/
    // https://github.com/vuejs/vue-cli/issues/1102
    // https://github.com/vuejs/vue-cli/tree/dev/docs
    proxy: {
      // micro / zeit / now.sh
      '/micro-api': {
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/micro-api': ''
        }
      },
    },
  },

};
