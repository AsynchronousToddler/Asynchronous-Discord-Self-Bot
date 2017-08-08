/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const DiscordClient    = require( 'discord.js' ).Client;
const EventEmitter     = require( 'events' ).EventEmitter;
const Request          = require( 'request' );
const OptionsValidator = require( './utils/options_validator.js' );

class AsynchronousSelfBot extends EventEmitter {
    constructor( options ) {
        super( );

        let invalid_options = OptionsValidator.validateOptions( options );

        if( invalid_options !== true ) {
            let error_message = invalid_options.join( ' - ' );

            throw new Error( error_message );
        }

        this.options = options || { };
    }
}

module.exports = AsynchronousSelfBot;