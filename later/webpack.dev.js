import { merge } from 'webpack-merge';
import common from './webpack.common.js';

const dev = function (env, argv) {
    return merge(common(env, argv), {
        mode: "development",
        devtool: "inline-source-map",
        devServer: {
            client: {
                logging: 'info',
                overlay: true,
            },
            compress: true,
            open: true,
            static: './ClientServer/public',
        },
        stats: {
            errorDetails: true,
        }
    })
};

export default dev;