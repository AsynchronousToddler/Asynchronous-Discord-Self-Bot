/**
 * Created by Liara Anna Maria Rørvig on 08/08/2017.
 */
'use strict';

const dot = require( 'dot-object' );

const DEFAULT_OPTIONS_REQUIREMENTS = [
    {
        name        : 'Discord',
        location    : 'tokens.discord',
        validate    : ( value ) => {
            return typeof value === 'string' && value.length > 0;
        },
        description : 'Must be a non-empty string'
    }
];

let validateOptions = ( options, requirements ) => {
    let errors = [];

    requirements = requirements || DEFAULT_OPTIONS_REQUIREMENTS;

    if ( options === undefined || options === null ) {
        errors.push( 'Invalid Options Object' );

        return errors;
    }

    requirements.forEach( requirement => {
        let requirement_name        = requirement.name;
        let requirement_description = requirement.description;
        let requirement_location    = requirement.location;
        let validateRequirement     = requirement.validate;
        let value                   = dot.pick( requirement_location, options );

        if( !validateRequirement( value ) ) {
            let error_message = `${requirement_name}[${requirement_location}]: ${requirement_description}`;

            errors.push( error_message );
        }
    } );

    return errors.length > 0 ? errors : true;
};

module.exports.DEFAULT_OPTIONS_REQUIREMENTS    = DEFAULT_OPTIONS_REQUIREMENTS;
module.exports.validateOptions                 = validateOptions;