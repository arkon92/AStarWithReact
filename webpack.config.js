var webpack = require('webpack');
var path = require('path');


var BUILD_DIR = path.resolve(__dirname, 'dist/public');
var APP_DIR = path.resolve(__dirname, 'src/app');

var config = {
    entry: [
        APP_DIR + '/index.js',
        APP_DIR + '/index.html'
    ],
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: APP_DIR,
                loader: ['babel-loader']
            },
            {
                test: [/\.html$/],
                include: APP_DIR,
                loader: ['file-loader?name=[name].[ext]']
            }, {
                test: /\.css$/,
                loader: 'style-loader'
            }, {
                test: /\.css$/,
                loader: 'css-loader',
                query: {
                    modules: true,
                    localIdentName: '[name]__[local]___[hash:base64:5]'
                }
            }
        ]
    },
};

module.exports = config;
