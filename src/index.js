/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const DiscordClient    = require( 'discord.js' ).Client;
const dot              = require( 'dot-object' );
const EventEmitter     = require( 'events' ).EventEmitter;
const PSNjs            = require( 'PSNjs' );
const request          = require( 'request' );
const OptionsValidator = require( './utils/options_validator.js' );

//Constants
const OPTION_DISCORD_TOKEN   = 'tokens.discord';
const OPTION_UPDATE_INTERVAL = 'update_interval';
const OPTION_PSN_EMAIL       = 'psn.email';
const OPTION_PSN_PASSWORD    = 'psn.password';
const OPTION_PSN_ID          = 'psn.id';

class AsynchronousSelfBot extends EventEmitter {
    constructor( options ) {
        super( );

        let invalid_options = OptionsValidator.validateOptions( options );

        if( invalid_options !== true ) {
            let error_message = invalid_options.join( ' - ' );

            throw new Error( error_message );
        }

        this.options = options;

        this.setupDiscord();
    }

    start( ) {
        this.discord_client.login( dot.pick( OPTION_DISCORD_TOKEN, this.options ) );

        this.on( 'discord:ready', ( ) => {
            this.setupPSN( );

            this.setupUpdater();
        } );
    }

    setupUpdater() {
        let raw_update_interval = dot.pick( OPTION_UPDATE_INTERVAL, this.options );
        let update_interval     = raw_update_interval * 1000 * 60; //Get the update interval

        this.updater = setInterval( ( ) => {
            this.update( );
        }, update_interval );
    }

    update( ) {
        console.log( 'Updating' );
        this.updatePSN( );
    }

    updatePSN( ) {
        let psn_id = dot.pick( OPTION_PSN_ID, this.options );

        this.psn.getProfile( psn_id, ( error, profile_data ) => {
           if( error ) {
               return this.emit( 'psn:error', error );
           }

           let platform = dot.pick( 'presence.primaryInfo.platform', profile_data ) || undefined;
           let game     = dot.pick( 'presence.primaryInfo.gameTitleInfo.titleName', profile_data ) || undefined;

           if( game ) {
               let game_status = game;

               if( platform ) {
                   game_status = `${game_status} on the ${platform}`;
               }

               this.psn_updated_game = true;
               this.discord_client.user.setGame( game_status )
           } else if( this.psn_updated_game ) {
               this.discord_client.user.setGame( );
           }
        } );
    }

    //
    //Event Handlers Start: Discord
    //

    onEventDiscordReady( ) {
        this.emit( 'discord:ready', true );
    }

    onEventDiscordMessageReceived( message ) {
        if( message === undefined || message === null ) {
            return;
        }

        //Only respond to our own messages
        if( message.author.id.toString( ) !== this.discord_client.user.id.toString( ) ) {
            return;
        }
    }

    onEventPSNReady( ) {
        this.updatePSN( );
    }

    //
    //Event Handlers End: Discord
    //

    setupDiscord( ) {
        this.discord_client = new DiscordClient( );

        this.discord_client.on( 'ready', ( ) => {
            this.onEventDiscordReady( );
        } );

        this.discord_client.on( 'message', ( message ) => {
            this.onEventDiscordMessageReceived( message );
        } );
    }

    setupPSN( ) {
        let email    = dot.pick( OPTION_PSN_EMAIL, this.options );
        let password = dot.pick( OPTION_PSN_PASSWORD, this.options );

        this.on( 'psn:ready', ( ) => {
            this.onEventPSNReady( );
        } );

        this.psn = new PSNjs(  {
            email    : email,
            password : password,
            debug    : true
        } );

        this.emit( 'psn:ready', true );
    }

}

module.exports = AsynchronousSelfBot;