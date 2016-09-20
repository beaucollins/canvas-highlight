import middleware from 'webpack-dev-middleware';
import busboy from 'connect-busboy';
import webpack from 'webpack';
import express from 'express';
import config from './webpack.config';
import { mkdirSync, createWriteStream } from 'fs'
import { join } from 'path'

const { PORT } = process.env;

const dir = join( process.cwd(), 'tmp' )
try {
	mkdirSync( dir )
} catch ( e ) {
}
express()
.use( middleware( webpack( config ) ) )
.use( busboy( { immediate: true } ) )
.post( '/upload', ( req, res ) => {
	req.busboy.on( 'file', ( name, stream ) => {
		const path = join( dir, ( new String( ( new Date() ).getTime() ) ).toString() )
		console.log( 'file', name, path )
		const out = createWriteStream( path )
		stream.pipe( out )
	} )
	res.json( { status: 'success' } )
} )
.listen( PORT || 15621 )
