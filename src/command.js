/**
 * Created by Liara Anna Maria Rørvig on 09/08/2017.
 */
'use strict';

const DEFAULT_CAN_RUN = ( message, bot ) => {
  return true;
};
const DEFAULT_HELP_DETAILED = 'I\'m sorry, but there\'s no help to get for this command.';
const DEFAULT_HELP_SIMPLE   = 'There\'s no help to get for this command.';

//
// PRAGMA MARK END: Constants
//

//
// PRAGMA MARK START: Command Class
//

class Command {

    constructor( options ) {
        this.options = options || { };
        this.aliases = options.aliases || [ ];

        this.setName( options.name );
        this.setSimpleHelp( options.help_simple || DEFAULT_HELP_SIMPLE );
        this.setDetailedHelp( options.help_detailed || DEFAULT_HELP_DETAILED );
        this.setCanRun( options.can_run || DEFAULT_CAN_RUN );
    }

    invoke( parameters, message, bot ) {
        let command_handler = ( resolve, reject ) => {
            return reject( 'This command have yet to be implemented' );
        };

        let promise = new Promise( command_handler );

        return promise;
    }

    handleReaction( reaction, trigger_message, response_message, parameters, bot ) {
        let command_handler = ( resolve, reject ) => {
            return reject( 'This command doesnt\'t care for reactions' );
        };

        let promise = new Promise( command_handler );

        return promise;
    }

    setName( name = null ) {
        if( name === null || name === undefined ) {
            throw new Error( 'The command name cannot be null nor undefined' );
        } else if ( typeof name !== 'string' ) {
            throw new Error( 'The command name have to be a string' );
        }

        this.name = name;
    }

    setSimpleHelp( help_simple = null ) {
        if ( help_simple === null || help_simple === undefined ) {
            help_simple = DEFAULT_HELP_LINE;
        }

        this.help_simple = help_simple;
    }

    setDetailedHelp( help_detailed = null ) {
        if ( help_detailed === null || help_detailed === undefined ) {
            help_detailed = DEFAULT_HELP_LINE;
        }

        this.help_detailed = help_detailed;
    }

    setCanRun( can_run = DEFAULT_CAN_RUN ) {
        if( typeof can_run !== 'function' ) {
            throw new Error( 'The command can_run parameter needs to be a function' );
        }

        this.can_run = can_run;
    }

}

module.exports = Command;