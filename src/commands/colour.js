/**
 * Created by Liara Anna Maria Rørvig on 24/07/2017.
 */
'use strict';

const Colours = require( '../../lib/colours.json' );
const Command = require( '../command.js' );
const dot     = require( 'dot-object' );

const NAME          = 'colour';
const HELP_SIMPLE   = 'Shows a small info message';
const HELP_DETAILED = 'Shows a small info message';
const CAN_RUN       = undefined;
const ALIASES       = [
    'c',
    'color'
];

class CommandColour extends Command {
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
            let hex = null;

            if ( parameters.length < 0 ) {
                let response = {
                    error   : true,
                    message : 'Colour is missing! Either run it with colour <hex> or colour <red> <green> <blue> [alpha]'
                };

                return reject( response );
            } else if ( parameters.length === 1 ) {
                let param = parameters[ 0 ];

                if ( param.startsWith( '#' ) ) {
                    param = param.slice( 1, param.length );
                }

                let param_length = param.length;

                if ( param_length !== 3 && param_length !== 6 && param_length !== 8 ) {
                    let response = {
                        error   : true,
                        message : 'Invalid hex colour. Needs to be either 3, 6 or 8 characters in length'
                    };

                    return reject( response );
                }

                if ( param_length !== 8 ) {
                    param = `FF${param}`;
                }

                hex = param;
            }

            let alpha_hex = hex.slice( 0, 2 );
            let alpha     = parseInt( alpha_hex, 16 );

            if ( alpha > 100 ) {
                alpha = 100;
            }

            hex = hex.slice( 2, hex.length );
            hex = hex.toUpperCase();

            let decimal   = parseInt( hex, 16 );
            let red       = ( decimal >> 16 ) & 255;
            let green     = ( decimal >> 8 ) & 255;
            let blue      = decimal & 255;
            let rgb_alpha = alpha / 100;

            //Embed
            let title         = 'Colour Info';
            let description   = `Colour info for ${hex}`;
            let colour        = decimal;
            let api_url       = dot.pick( 'http.base_url', bot.options );
            let thumbnail_url = `${api_url}/colour/${red}/${green}/${blue}/${alpha}`;
            let thumbnail     = {
                url : thumbnail_url
            };
            let field_hex     = {
                name   : 'Hexidecimal',
                value  : `#${hex}`,
                inline : true
            };
            let field_rgb     = {
                name   : 'rgb',
                value  : `rgb(${red}, ${green}, ${blue})`,
                inline : true
            };
            let field_rgba    = {
                name   : 'rgba',
                value  : `rgba(${red}, ${green}, ${blue}, ${rgb_alpha})`,
                inline : true
            };
            let field_decimal = {
                name   : 'Decimal',
                value  : decimal,
                inline : true
            };
            let fields        = [
                field_hex,
                field_rgb,
                field_rgba,
                field_decimal
            ];
            let embed         = {
                title       : title,
                description : description,
                thumbnail   : thumbnail,
                fields      : fields,
                color       : colour
            };

            let response = {
                error   : false,
                message : {
                    embed : embed
                }
            };

            return resolve( response );
        };

        let promise = new Promise( command_handler );

        return promise;
    }
}

module.exports = CommandColour;