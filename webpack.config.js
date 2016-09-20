const autoprefixer = require( 'autoprefixer' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

module.exports = {
	devtool: 'sourcemap',
	entry: {
		ext: './app/ext.js',
		dock: './app/dock.js',
		app: './app/index.js',
		screenshot: './app/screenshot.js'
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].js'
	},
	module: {
		preLoaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'eslint-loader' ] }
		],
		loaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'babel' ] },
			{ test: /\.scss$/, loader: 'style-loader!css-loader!postcss-loader!sass-loader'}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json', '.scss', '.css' ],
		moduleDirectories: [ 'app', 'lib', 'node_modules' ]
	},
	plugins: [
		new HtmlWebpackPlugin( { filename: 'global.html', excludeChunks: ['dock', 'app'] } ),
		new HtmlWebpackPlugin( { filename: 'inject.html', excludeChunks: ['ext', 'app' ] } ),
		new HtmlWebpackPlugin( { filename: 'index.html', chunks: [ 'app', 'screenshot' ] } )
	],
	postcss: [ autoprefixer() ]
};
