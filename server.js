import middleware from 'webpack-dev-middleware';
import webpack from 'webpack';
import express from 'express';
import config from './webpack.config';

const { PORT } = process.env;

express()
.use( middleware( webpack( config ) ) )
.listen( PORT || 15621 )
