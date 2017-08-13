/**
 * Created by Liara Anna Maria Rørvig on 12/08/2017.
 */
'use strict';

const sharp = require( 'sharp' );

let route_v1 = ( request, response ) => {
    let params = request.params;

    for ( let index = 0; index < 3; index++ ) {
        let colour = params[ index ];

        if ( colour < 0 || 255 < colour ) {
            return response.send( {
                code    : 'InvalidColour',
                message : `${colour} is not a valid RGB value`
            } );
        }
    }

    let width  = 250;
    let height = 250;
    let red    = params[ 0 ];
    let green  = params[ 1 ];
    let blue   = params[ 2 ];
    let alpha  = 100;

    if ( params[ 3 ] ) {
        alpha = params[ 3 ];
    }

    if ( alpha < 0 || 100 < alpha ) {
        return response.send( {
            code    : 'InvalidAlpha',
            message : `${alpha} is not a valid alpha value`
        } );
    }

    alpha = alpha / 100;

    let image = sharp( {
        create : {
            height     : width,
            width      : height,
            background : {
                r     : red,
                g     : green,
                b     : blue,
                alpha : alpha
            },
            channels   : 4
        }
    } )
        .png()
        .toBuffer()
        .then( buffer => {
            let content_length = buffer.byteLength;
            let head           = {
                'Content-Length' : content_length,
                'Content-Type'   : 'image/png'
            };

            response.writeHead( 200, head );
            response.write( buffer );
            response.end();
        } ).catch( error => {
            return response.send( {
                code    : 'CanvasError',
                message : error.message
            } );
        } );
};

let router = [
    {
        handler : route_v1,
        method  : 'get',
        options : {
            path    : /^\/colour\/(\d{1,3})\/(\d{1,3})\/(\d{1,3})\/(\d{1,3})/,
            version : '1.0.0'
        }
    },
    {
        handler : route_v1,
        method  : 'get',
        options : {
            path    : /^\/colour\/(\d{1,3})\/(\d{1,3})\/(\d{1,3})/,
            version : '1.0.0'
        }
    }
];

module.exports.router   = router;
module.exports.route_v1 = route_v1;