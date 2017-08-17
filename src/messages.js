/**
 * Created by Liara Anna Maria Rørvig on 09/06/2017.
 */
'use strict';

let isAuthor = ( message, bot ) => {
    if ( !message || !message.author || !message.author.id ) {
        return false;
    }

    return message.author.id === bot.discord_client.user.id;
};

let isDirectMessage = ( message ) => {
    if ( message === null || message === undefined ) {
        throw new Error( 'The message object cannot be null or undefined' );
    }

    return message.channel.type === 'dm';
};

let createMessageListener = ( message, type, data, handler, bot ) => {
    let message_id = message.id.toString( );

    if( !bot.message_listeners[ message_id ] ) {
        bot.message_listeners[ message_id ] = { };
    }

    if( !bot.message_listeners[ message_id ][ type ] ) {
        bot.message_listeners[ message_id ][type] = [];
    }

    bot.message_listeners[ message_id ][type].push( {
        handler : handler,
        data    : data
    } );
};

let getMessageListeners = ( message, type, bot ) => {
    let message_listeners = bot.message_listeners || {};
    let message_listener  = message_listeners[ message.id.toString() ];

    if ( message_listener ) {
        let handlers = message_listener[ type ] || [];

        return handlers;
    }

    return [];
};

module.exports.isAuthor              = isAuthor;
module.exports.isDirectMessage       = isDirectMessage;
module.exports.createMessageListener = createMessageListener;
module.exports.getMessageListeners   = getMessageListeners;