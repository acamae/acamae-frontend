import { resolve as _resolve, dirname as _dirname } from 'path';
import { fileURLToPath } from 'url';

import CopyPlugin from 'copy-webpack-plugin';
import { config } from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as sass from 'sass';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __dirname = _dirname(fileURLToPath(import.meta.url));

export default env => {
  const isProduction = env.production === true;
  const envPath = isProduction ? '.env.production' : '.env.development';
  const envParsed = config({ path: envPath }).parsed || {};

  // Ensure NODE_ENV is defined
  const nodeEnv = isProduction ? 'production' : 'development';
  console.log(`Webpack: Configuring environment as ${nodeEnv}`);

  const envKeys = Object.keys(envParsed).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(envParsed[key]);
    return acc;
  }, {});

  // Add NODE_ENV explicitly
  envKeys['process.env.NODE_ENV'] = JSON.stringify(nodeEnv);

  console.log(envKeys);

  return {
    mode: nodeEnv,
    entry: `${_resolve(__dirname, 'src')}/index.tsx`,
    watch: !isProduction,
    watchOptions: !isProduction
      ? {
          ignored: /node_modules/,
          poll: 1000,
        }
      : undefined,
    output: {
      path: _resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      publicPath: '/',
      clean: true,
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: !isProduction
      ? {
          host: '0.0.0.0',
          port: 3000,
          allowedHosts: 'all',
          compress: true,
          hot: true,
          liveReload: true,
          historyApiFallback: true,
          static: {
            directory: _resolve(__dirname, 'public'),
            watch: true,
          },
          client: {
            webSocketURL: 'auto://0.0.0.0:0/ws',
            overlay: true,
          },
          watchFiles: {
            paths: [
              `${_resolve(__dirname, 'src')}/**/*`,
              `${_resolve(__dirname, 'src')}/infrastructure/i18n/locales/*.json`,
            ],
            options: {
              usePolling: true,
              interval: 2000,
            },
          },
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      : undefined,
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          options: {
            logLevel: 'info',
          },
          exclude: /node_modules/,
        },

        /**
         * SASS / SCSS / CSS
         */
        {
          test: /\.s?[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            // Translates CSS into CommonJS
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            // Compiles Sass to CSS
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
                // Exclude node_modules from sass-loader processing
                additionalData: (content, loaderContext) => {
                  if (loaderContext.resourcePath.includes('node_modules')) {
                    return content;
                  }
                  return content;
                },
                api: 'modern-compiler',
                // Enable source maps
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[contenthash][ext][query]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[contenthash][ext][query]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': _resolve(__dirname, 'src/'),
        '@domain': _resolve(__dirname, 'src/domain'),
        '@application': _resolve(__dirname, 'src/application'),
        '@infrastructure': _resolve(__dirname, 'src/infrastructure'),
        '@ui': _resolve(__dirname, 'src/ui'),
        '@shared': _resolve(__dirname, 'src/shared'),
        '@styles': _resolve(__dirname, 'src/ui/styles'),
        '@i18n': _resolve(__dirname, 'src/infrastructure/i18n'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: _resolve(__dirname, 'public/index.html'),
        inject: true,
        favicon: _resolve(__dirname, 'public/assets/favicon.png'),
      }),
      new CopyPlugin({
        patterns: [{ from: 'public/assets', to: 'assets', noErrorOnMissing: true }],
      }),
      new webpack.DefinePlugin(envKeys),
      ...(isProduction && env.analyze
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: true,
            }),
          ]
        : []),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].chunk.css' : 'css/[name].css',
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
          },
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
            name: 'redux-vendor',
            chunks: 'all',
          },
          i18n: {
            test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            name: 'i18n-vendor',
            chunks: 'all',
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};
