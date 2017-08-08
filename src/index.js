/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const DiscordClient    = require( 'discord.js' ).Client;
const dot              = require( 'dot-object' );
const EventEmitter     = require( 'events' ).EventEmitter;
const request          = require( 'request' );
const OptionsValidator = require( './utils/options_validator.js' );

const OPTION_DISCORD_TOKEN = 'tokens.discord';

class AsynchronousSelfBot extends EventEmitter {
    constructor( options ) {
        super( );

        let invalid_options = OptionsValidator.validateOptions( options );

        if( invalid_options !== true ) {
            let error_message = invalid_options.join( ' - ' );

            throw new Error( error_message );
        }

        this.options        = options;

        this.setupDiscord();
    }

    start( ) {
        this.discord_client.login( dot.pick( OPTION_DISCORD_TOKEN, this.options ) );
    }

    //
    //Event Handlers Start: Discord
    //

    onEventDiscordReady( ) {
        this.emit( 'ready', true );
    }

    //
    //Event Handlers End: Discord
    //

    setupDiscord() {
        this.discord_client = new DiscordClient( );

        this.discord_client.on( 'ready', ( ) => {
            this.onEventDiscordReady( );
        } );
    }

}

module.exports = AsynchronousSelfBot;