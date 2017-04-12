const webpack = require('webpack');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';


module.exports = {
    entry: './src/scripts/app.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            options: { presets: ['es2015'] },
            exclude: [/node_modules/]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEVELOPMENT: JSON.stringify(isDevelopment)
        })
    ]
};

if (!isDevelopment) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: false,
            compress: true,
            comments: false,
            drop_console: true,
            warnings: false,
            unsafe: true
        })
    );
}
