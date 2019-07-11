const paths = require("./paths");
const widgetConf = require("./widget.config.json");
const XMLPlugin = require("xml-webpack-plugin");
const ArchivePlugin = require("webpack-archive-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const fs = require("fs-extra");

/*
 * 'xml-webpack-plugin' & 'webpack-archive-plugin' causing some webpack deprecations warnigns.
 * These warnings are safe to be ignored as we're in webpack 4, consider to periodically check if these
 * dependencies can be updated especially before going to webpack 5.
 * Uncomment the line below to be able to trace webpack deprecations.
 * Set 'process.noDeprecation' to 'false' to get deprecations trace printed to your cmd/terminal.
 */
process.traceDeprecation = true;
process.noDeprecation = true;

const MODES = {
  DEV: "development",
  PROD: "production",
};

const isDev = process.env.MODE === MODES.DEV;

const widgetDir = "com/mendix/widget/custom";
const widgetUIDir = `${widgetDir}/ui`;

const widgetXMLFiles = [
  {
    template: paths.widgetPackageXML,
    filename: `package.xml`,
    data: {
      NAME: widgetConf.name,
    },
  },
  {
    template: paths.widgetConfigXML,
    filename: `${widgetConf.name}.xml`,
    data: {
      NAME: widgetConf.name,
      FRIENDLY_NAME: widgetConf.friendlyName,
      WIDGET_DESC: widgetConf.description,
    },
  },
];

module.exports = {
  mode: isDev ? MODES.DEV : MODES.PROD,
  target: "web",
  devtool: isDev ? "eval-source-map" : false,
  watch: isDev,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 500,
  },
  entry: paths.srcEntry,
  output: {
    path: isDev ? paths.buildDir : paths.distDir,
    filename: `${widgetDir}/${widgetConf.name}.js`,
    libraryTarget: "umd",
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              "@babel/plugin-transform-react-jsx",
              "@babel/plugin-proposal-object-rest-spread",
            ],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              config: {
                path: paths.confDir,
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: `[name].[ext]`,
              outputPath: `${widgetUIDir}/images`,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["node_modules"],
  },
  externals: ["react", "react-dom"],
  plugins: _getPlugins(),
};

function _getPlugins() {
  fs.ensureDirSync(paths.distDir);
  const plugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${widgetUIDir}/${widgetConf.name}.css`,
    }),
    new XMLPlugin({
      files: widgetXMLFiles,
    }),
    new ArchivePlugin({
      output: `${paths.distDir}/${widgetConf.name}`,
      format: "zip",
      ext: "mpk",
    }),
  ];
  if (paths.mxProjectRootDir) {
    plugins.push(
      new ArchivePlugin({
        output: `${paths.mxProjectRootDir}/widgets/${widgetConf.name}`,
        format: "zip",
        ext: "mpk",
      }),
    );
  }

  return plugins;
}
