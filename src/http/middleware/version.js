/**
 * Created by Liara Anna Maria Rørvig on 12/08/2017.
 */
'use strict';

const errors = require( 'restify-errors' );
const Semver = require( 'semver' );

//Thank you to the original stack overflow answer https://stackoverflow.com/a/29706259

let semverURLMiddleware = ( request, response, next ) => {
    let pieces  = request.url.replace( /^\/+/, '' ).split( '/' );
    let version = pieces[ 0 ];

    if ( !Semver.valid(version) ) {
        version = version.replace( /v(\d{1})\.(\d{1})\.(\d{1})/, '$1.$2.$3' );
        version = version.replace( /v(\d{1})\.(\d{1})/, '$1.$2.0' );
        version = version.replace( /v(\d{1})/, '$1.0.0' );
    }

    if (Semver.valid( version ) ) {
        request.url                         = request.url.replace( pieces[ 0 ], '' );
        request.headers                     = request.headers || [ ];
        request.headers[ 'accept-version' ] = version;
    } else {
        return next( new errors.InvalidVersionError( 'Missing an/or invalid version' ) );
    }

    return next();
};

module.exports = semverURLMiddleware;