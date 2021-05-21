const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const DESTFOLDER = path.resolve(__dirname, 'dist');

module.exports = [{
  entry: './src/background.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  name: 'prod'
}];