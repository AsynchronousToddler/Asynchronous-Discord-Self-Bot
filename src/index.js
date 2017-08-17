/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const CommandsHandler  = require( './commands.js' );
const CommandColour    = require( './commands/colour.js' );
const CommandLMGTFY    = require( './commands/lmgtfy.js' );
const CommandPSN       = require( './commands/psn.js' );
const DiscordClient    = require( 'discord.js' ).Client;
const dot              = require( 'dot-object' );
const EventEmitter     = require( 'events' ).EventEmitter;
const HTTPAPI          = require( './http_api.js' );
const MessagesHandler  = require( './messages.js' );
const PSNjs            = require( 'PSNjs' );
const request          = require( 'request' );
const OptionsValidator = require( './utils/options_validator.js' );

//Constants
const OPTION_DISCORD_TOKEN   = 'tokens.discord';
const OPTION_UPDATE_INTERVAL = 'update_interval';
const OPTION_PSN_EMAIL       = 'psn.email';
const OPTION_PSN_PASSWORD    = 'psn.password';
const OPTION_PSN_ID          = 'psn.id';

const DEFAULT_COMMAND_NAME   = 'help';

class AsynchronousSelfBot extends EventEmitter {
    constructor( options ) {
        super( );

        let invalid_options = OptionsValidator.validateOptions( options );

        if( invalid_options !== true ) {
            let error_message = invalid_options.join( ' - ' );

            throw new Error( error_message );
        }

        this.options           = options;
        this.commands          = [];
        this.message_listeners = {};

        CommandsHandler.registerCommand(new CommandColour( ), this.commands );
        CommandsHandler.registerCommand(new CommandLMGTFY( ), this.commands );
        CommandsHandler.registerCommand(new CommandPSN( ), this.commands );

        this.setupDiscord();
    }

    start( ) {
        let http_options = dot.pick( 'http', this.options );

        if( http_options ) {
            this.setupHTTP( );
        }

        http_options = http_options || { };

        if( http_options.http_only ) {
            return;
        }

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

               this.psn_updated_game = false;
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
        if( !MessagesHandler.isAuthor( message, this ) ) {
            return;
        }

        if ( CommandsHandler.isCommand( message ) ) {
            let command_parts = CommandsHandler.prepareMessageAsCommand( message ); //Prepare the message as a command. Typically splitting it up into an array and removing the command prefix
            let command_name  = command_parts.shift( ); //Remove the first "parameter" as it's the name of the command
            let command       = CommandsHandler.findCommand( command_name || DEFAULT_COMMAND_NAME, this.commands ); //Find the command from the list of registered command

            if( command !== null ) {
                return this.emit( 'discord:command', command, command_parts, message );
            }

            return this.onEventDiscordCommand( command, command_parts, message );
        }
    }

    onEventDiscordCommand( command, parameters, message ) {
        if( !command || !message ) {
            this.emit( 'discord:error', new Error( 'Received invalid command trigger: Missing command or message' ) );
        }

        let command_can_run_result = command.can_run( message );

        //Check that we can run the command or not. If we can, the result will be a boolean true. If not, it'll be a string with the error message.
        if( command_can_run_result !== true ) {
            let response = {
                message : command_can_run_result,
                error   : true
            };

            return CommandsHandler.respondToCommand( command, message, response, this );
        }

        //Create a "all around" handler for the command response to log the error and respond to the command if need be
        let command_responder = ( error, response ) => {
            if( error ) {
                console.log( error );
            }

            if( response ) {
                CommandsHandler.respondToCommand( command, message, response, this );
            }
        };

        //Invoke the command with the parameters, the original message object and the "client" and await response
        command.invoke( parameters, message, this ).then( response => {
            command_responder( undefined, response );
        } ).catch( command_responder );
    }

    onEventDiscordRemoveReaction( reaction, user ) {
        //Only respond to our own messages
        if( !MessagesHandler.isAuthor( reaction.message, this ) ) {
            return;
        }

        let emoji = reaction.emoji.name;
        let type  = 'reaction_remove_' + emoji;
        let message = reaction.message;
        let event_listeners = MessagesHandler.getMessageListeners( message, type, this );

        if( event_listeners.length > 0 ) {
            message.react( emoji );

            event_listeners.forEach( listener => {
                try {
                  let handler = listener.handler;
                  let data    = listener.data;

                  handler( data, message, this );
                } catch( e ) {
                    console.log( e );
                }
            } );
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

        this.discord_client.on( 'messageReactionRemove', ( reaction, user ) => {
            this.onEventDiscordRemoveReaction( reaction, user );
        } );

        this.on( 'discord:command', ( command, parameters, message ) => {
            this.onEventDiscordCommand( command, parameters, message );
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
            password : password
        } );

        this.emit( 'psn:ready', true );
    }

    setupHTTP( ) {
        let options = dot.pick( 'http', this.options ) || { };
        let port    = options.port;
        this.http_api = new HTTPAPI( options , this );

        this.http_api.on( 'listening', ( ) => {
            this.emit( 'http:ready', port );
        } );

        this.http_api.listen( port );
    }

}

module.exports = AsynchronousSelfBot;
