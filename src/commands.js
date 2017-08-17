/**
 * Created by Liara Anna Maria Rørvig on 09/08-/2017.
 */
'use strict';

const Colours         = require( '../lib/colours.json' );
const Command         = require( './command.js' );
const MessagesHandler = require( './messages.js' );

const CommandIdentifier = '$';
const CommandSplitter   = ' ';
const CommandPrefixes   = [
    'at',
    'async',
    'asynchtoddler',
    'asynchronoustoddler'
];

let isCommand = ( message ) => {
    let message_content = message.content.toLowerCase();

    if ( !message_content.startsWith( CommandIdentifier ) ) {
        return false;
    }

    let command_parts     = message_content.split( CommandSplitter );
    let initiator_command = command_parts.shift();

    initiator_command = initiator_command.substring( 1, initiator_command.length );

    if ( doesNeedCommandPrefix( message ) ) {
        return isCommandPrefix( initiator_command );
    }

    return true;
};

let doesNeedCommandPrefix = ( message ) => {
    if ( !message ) {
        throw new Error( 'Missing message object' );
    }

    return !MessagesHandler.isDirectMessage( message );
};

let isCommandPrefix = ( string_to_check ) => {
    for ( let i = 0; i < CommandPrefixes.length; i++ ) {
        let command_prefix = CommandPrefixes[ i ];

        if ( string_to_check === command_prefix ) {
            return true;
        }
    }

    return false;
};

let prepareMessageAsCommand = ( message ) => {
    if ( !message || !message.content ) {
        throw new Error( 'Invalid message object' );
    }

    let message_content = message.content || '';

    if ( message_content.startsWith( CommandIdentifier ) ) {
        message_content = message_content.slice( CommandIdentifier.length );
    }

    let command_parts = message_content.split( CommandSplitter );

    if ( isCommandPrefix( command_parts[ 0 ] ) ) {
        command_parts.shift();
    }

    return command_parts;
};

let findCommand = ( name, commands ) => {
    if ( !Array.isArray( commands ) ) {
        throw new Error( 'The commands parameter isn\'t an array' );
    }

    for ( let index = 0; index < commands.length; index++ ) {
        let command = commands[ index ];

        if ( !( command instanceof Command ) ) {
            continue;
        }

        if ( name === command.name ) {
            return command;
        }

        for ( let alias_index = 0; alias_index < command.aliases.length; alias_index++ ) {
            let alias = command.aliases[ alias_index ];

            if ( name === alias ) {
                return command;
            }
        }
    }

    return null;
};

let registerCommand = ( command, commands ) => {
    if ( findCommand( command.name, commands ) !== null ) {
        throw new Error( `The command ${command.name} is clashing with another command.` );
    }

    commands.push( command );
};

let respondToCommand = ( command, message, response, bot ) => {
    let response_handler = ( resolve, reject ) => {
        if ( message === null || message === undefined ) {
            return reject( new Error( 'Invalid message object' ) );
        } else if ( response === null || response === undefined ) {
            return reject( new Error( 'Invalid response object' ) );
        } else if ( response.error !== true && response.error !== false ) {
            return reject( new Error( 'response.error is missing or invalid' ) );
        }

        let emoji = response.emoji || ( response.error ? '😿' : '😺' );

        if ( response.error && typeof response.message === 'string' && response.no_wrap === undefined ) {
            let wrapped_message = {
                embed : {
                    title       : 'Uh oh',
                    color       : Colours.red,
                    description : response.message,
                    footer      : {
                        icon_url : 'https://cdn.discordapp.com/avatars/258628995111714820/b9576cbd8b7f641fd08f1fba3174fe3b.png',
                        text     : 'Liara A. M. Rørvig'
                    }
                }
            };

            response.message = wrapped_message;
        }

        if ( response.no_delete !== true ) {
            message.delete();
        }

        if ( response.no_delete && response.reactions === undefined && emoji ) {
            //No need to wait for this nonsense to complete as it's not an important task
            message.react( emoji ).then( undefined, reaction_error => {
                console.log( reaction_error );
            } );
        }

        if ( response.message === undefined || response.message === null ) {
            return resolve();
        }

        message.channel.send( response.message ).then( ( sent_message ) => {
            if ( !response.reactions ) {
                return resolve();
            }

            let reaction_promises = [];
            let reactions         = response.reactions;

            reactions.forEach( reaction => {
                let emoji   = reaction.emoji;
                let promise = sent_message.react( emoji );

                reaction_promises.push( promise );
            } );

            Promise.all( reaction_promises ).then( () => {
                reactions.forEach( reaction => {
                    let emoji         = reaction.emoji;
                    let data          = reaction.data.data;
                    let action        = reaction.data.action;
                    let type          = 'reaction_remove_' + emoji;
                    let listener_data = {
                        action  : action,
                        data    : data,
                        command : command
                    };

                    MessagesHandler.createMessageListener( sent_message, type, listener_data, ( reaction_event, reaction_message, bot ) => {
                        let action     = reaction_event.action;
                        let parameters = reaction_event.data;
                        let command    = reaction_event.command;
                        let func       = 'reactionRemove' + action;

                        if( !command[ func ] ) {
                            return bot.emit( 'error', new Error( 'Command is missing ' + func ) );
                        }

                        command[func]( parameters, reaction_message, bot );
                    }, bot );
                } );

                return resolve();
            } ).catch( reaction_error => {
                reject( reaction_error );
            } );

        } ).catch( reject );
    };

    let promise = new Promise( response_handler );

    return promise;
};

module.exports.isCommand               = isCommand;
module.exports.doesNeedCommandPrefix   = doesNeedCommandPrefix;
module.exports.isCommandPrefix         = isCommandPrefix;
module.exports.prepareMessageAsCommand = prepareMessageAsCommand;
module.exports.findCommand             = findCommand;
module.exports.registerCommand         = registerCommand;
module.exports.respondToCommand        = respondToCommand;