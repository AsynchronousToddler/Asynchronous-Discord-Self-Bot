/**
 * Created by Liara Anna Maria Rørvig on 12/08/2017.
 */
'use strict';

let JSONFormatter = ( request, response, body, callback ) => {
    if ( body instanceof Error ) {
        if ( body.body ) {
            body = body.body;
        } else {
            body = {
                message : body.message
            };
        }
    } else if ( Buffer.isBuffer( body ) ) {
        body = body.toString( 'base64' );
    }

    let should_pretty_print = request.query.pretty_print !== 'false';
    let data                = JSON.stringify( body, null, should_pretty_print ? 2 : 0 );
    let content_length      = Buffer.byteLength( data );

    response.setHeader( 'Content-Length', content_length );

    return data;
};

module.exports = JSONFormatter;