/**
 * Created by Liara Anna Maria Rørvig on 12/08/2017.
 */
'use strict';

const JSONFormatter       = require( './http/formatters/json.js' );
const restify             = require( 'restify' )
const restify_router      = require( 'restify/lib/router.js' );
const restify_bunyan      = require( 'restify/lib/bunyan_helper.js' );
const restify_server      = require( 'restify/lib/server.js' );
const RouteColour         = require( './http/routes/colour.js' ).router;
const SemverURLMiddleware = require( './http/middleware/version.js' );

const NAME = 'AsynchronousDiscordSelfBot';

class HTTPAPI extends restify_server {
    constructor( options, bot ) {
        let restify_options = {
            name       : NAME,
            formatters : {
                'application/json' : JSONFormatter
            }
        };

        restify_options.log    = restify_bunyan.createLogger( restify_options.name );
        restify_options.router = new restify_router( restify_options );

        super( restify_options );

        this.options = options || options;
        this.bot     = bot;

        this.setup();
    }

    setup() {
        this.pre( SemverURLMiddleware );
        this.pre( restify.pre.sanitizePath() );
        this.pre( restify.pre.userAgentConnection() );
        this.use( restify.plugins.acceptParser( this.acceptable ) );
        this.use( restify.plugins.queryParser() );
        this.use( restify.plugins.bodyParser() );

        this.setupRoute( RouteColour );

    }

    setupRoute( router ) {
        if ( !Array.isArray( router ) ) {
            throw new Error( 'Invalid router object! ' + JSON.stringify( router ) );
        }

        router.forEach( route => {
            let handler       = route.handler;
            let method        = route.method;
            let options       = route.options;
            let bound_handler = handler.bind( this.bot );

            this[ method ]( options, bound_handler );
        } );
    }
}

module.exports = HTTPAPI;