/**
 * Created by Liara Anna Maria Rørvig on 24/07/2017.
 */
'use strict';

const Command = require( '../command.js' );
const URL     = require( 'url' );

const NAME          = 'lmgtfy';
const HELP_SIMPLE   = 'Creates a let me google that for you link';
const HELP_DETAILED = 'Creates a let me google that for you link for those "end users" that can\'t google for themselves';
const CAN_RUN       = undefined;
const ALIASES       = [
    'google'
];

class CommandLMGTFY extends Command {
    constructor() {
        super( {
            name          : NAME,
            help_simple   : HELP_SIMPLE,
            help_detailed : HELP_DETAILED,
            can_run       : CAN_RUN,
            aliases       : ALIASES
        } );
    }

    invoke( parameters, message, bot ) {
        let command_handler = ( resolve, reject ) => {
            if ( parameters.length < 0 ) {
                let response = {
                    error   : true,
                    message : 'You need to actually tell them what to google'
                };

                return reject( response );
            }

            /*
             *
             * Okay story time folks. Yes, I know I can just join the parameters by +'s and append ?q=${pars} to the link and call it a day
             * But that my friend, is some bullshit. There's no need for to reinvent the wheel when this can do it for me. What if I use special
             * characters in the parameters? Or similar? That stuff needs to be URLEncoded, and I'm not about to start looping that stuff when
             * there's a perfectly capable module inbuilt in node
             *
             */
            let query      = parameters.join( ' ' );
            let url_object = URL.parse( 'https://lmgtfy.com', true );

            url_object.query.q = query;

            let url     = URL.format( url_object );
            let message = `-Coughs- May wanna google that you know? ➡️ ${url}`;

            let response = {
                error   : false,
                message : message
            };

            return resolve( response );
        };

        let promise = new Promise( command_handler );

        return promise;
    }
}

module.exports = CommandLMGTFY;