const BannerPlugin = require( 'webpack' ).BannerPlugin;
const autoprefixer = require( 'autoprefixer' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { version } = require( './package' );

module.exports = {
	devtool: 'sourcemap',
	entry: {
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
		new HtmlWebpackPlugin( { filename: 'index.html', chunks: [ 'app', 'screenshot' ] } ),
		new BannerPlugin( `https://github.com/beaucollins/canvas-highlight ${ version }` )
	],
	postcss: [ autoprefixer() ]
};
