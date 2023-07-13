const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  devServer: {
    open: true,
    port: 7777,
  },
  publicPath: '/',
  outputDir: 'dist',
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jquery: 'jquery',
        'window.jQuery': 'jquery',
        jQuery: 'jquery',
      }),

      new MonacoWebpackPlugin(),
    ],
  },
};
