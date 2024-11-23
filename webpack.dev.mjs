import { merge } from 'webpack-merge';
import { common, backend } from './webpack.common.mjs';

const dev = function (env, argv) {
    return merge(common(env, argv),{
        mode: "development",
        devtool: "inline-source-map",
        devServer: {
            client: {
                logging: 'info',
                overlay: true,
            },
            compress: true,
            open: true,
            static: './public',
        },
        stats: {
            errorDetails: true,
        }
    })
};

export default dev;