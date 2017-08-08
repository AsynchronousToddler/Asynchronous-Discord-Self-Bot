/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const AsynchronousSelfBot = require( './src/index.js' );
const fs                  = require( 'fs' );
const path                = require( 'path' );

const DEFAULT_CONFIG_FILE = './config.json';

let process_arguments     = process.argv.slice( 2 );
let config_file           = process_arguments.length > 0 ? process_arguments[ 0 ] : DEFAULT_CONFIG_FILE;
let full_config_file_path = path.join( __dirname, config_file );

fs.readFile( full_config_file_path, ( file_read_error, file_content )=> {
    if( file_read_error ) {
        console.log( file_read_error.stack );

        return process.exit( 1 );
    }

    let configuration;

    try {
        configuration = JSON.parse( file_content );
    } catch( file_content_parse_error ) {
        console.log( file_content_parse_error.stack );

        return process.exit( 1 );
    }

    let app = new AsynchronousSelfBot( configuration );

    app.on( 'error', ( error ) => {
        console.log( error.stack );

        process.exit( 1 );
    } );

    app.start( );
} );