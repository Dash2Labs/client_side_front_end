import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import CompressionPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';


const production = {
    plugins: [
        new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: { level: 11 },
            threshold: 10240,
            minRatio: 0.8,
        })],
    optimization: {
        splitChunks: {
            chunks: 'all',
            automaticNameDelimiter: '-',
        },
        minimize: true,
        minimizer: [new TerserPlugin(
            {
                parallel: true,
                terserOptions: {
                    ecma: 2020,
                    mangle: false,
                    compress: {
                        drop_console: ['log', 'info'],
                    },
                    output: {
                        comments: false,
                    },
                },
            }
        )],
    },
};

const prod = function (env, argv) {
    return merge(common(env, argv), production)
};

export default prod;