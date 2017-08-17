/**
 * Created by Liara Anna Maria Rørvig on 24/07/2017.
 */
'use strict';

const Command         = require( '../command.js' );
const CommandsHandler = require( '../commands.js' );
const Colours         = require( '../../lib/colours.json' );

const NAME          = 'help';
const HELP_SIMPLE   = 'Gives you help with commands';
const HELP_DETAILED = 'Use !help <command> to get more help for a command';
const CAN_RUN       = undefined;

class CommandHelp extends Command {
    constructor( ) {
        super( {
            name          : NAME,
            help_simple   : HELP_SIMPLE,
            help_detailed : HELP_DETAILED,
            can_run       : CAN_RUN
        } );
    }

    invoke( parameters, message, client ) {
        let command_handler = ( resolve, reject ) => {
            let colour = Colours.pink;
            let description;
            let error  = false;
            let fields;
            let title;

            if ( parameters.length === 0 ) {
                let commands = client.commands;

                description = 'Here\'s some info on how to use the bot. If you\'re using the bot in a DM just use !<command> If you\'re on a server, use !liara <command> you can also use "li" instead of liara. To get more help from a command, run !help <command> Remember to run it with !liara help if it\'s on a server';
                fields      = [ ];
                title       = 'OHMYGOSH HELP!';

                commands.forEach( command => {

                    let command_name        = command.name;
                    let command_simple_help = command.help_simple;

                    let field = {
                        inline : true,
                        name   : command_name,
                        value  : command_simple_help
                    };

                    fields.push( field );
                } );
            } else {
                let command_name = parameters.shift();
                let command      = CommandsHandler.findCommand( command_name, client.commands );

                if( command === null ) {
                    colour      = Colours.red;
                    description = 'I\'m sorry but that command doesn\'t exist';
                    error       = true;
                    title       = 'Whoops ;-;';
                } else {
                    description = command.help_detailed;
                    title       = `Help for: ${command.name}`;
                }
            }

            let response = {
                message : {
                    embed : {
                        title       : title,
                        fields      : fields,
                        color       : colour,
                        description : description,
                        footer      : {
                            icon_url : 'https://cdn.discordapp.com/avatars/258628995111714820/b9576cbd8b7f641fd08f1fba3174fe3b.png',
                            text     : 'Liara A. M. Rørvig'
                        }
                    }
                },
                error   : error
            };

            return resolve( response );
        };

        let promise = new Promise( command_handler );

        return promise;
    }
}

module.exports = CommandHelp;