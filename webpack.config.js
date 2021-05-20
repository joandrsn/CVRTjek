const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const DESTFOLDER = path.resolve(__dirname, 'dist');

module.exports = [{
  entry: './src/background.js',
  devtool: false,
  output: {
    filename: 'background.js',
    path: DESTFOLDER,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/icons", to: path.join(DESTFOLDER, "icons") },
        { from: "src/_locales", to: path.join(DESTFOLDER, "_locales") },
        { from: "src/manifest.json", to: DESTFOLDER }
      ],
    }),
  ],
  name: 'prod'
},
{
  entry: './src/background.js',
  devtool: false,
  output: {
    filename: 'background.js',
    path: DESTFOLDER,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/icons", to: path.join(DESTFOLDER, "icons") },
        { from: "src/_locales", to: path.join(DESTFOLDER, "_locales") },
        { from: "src/manifest.json", to: DESTFOLDER }
      ],
    }),
  ],
  optimization: {
    minimize: false
  },
  name: 'debug'
}];