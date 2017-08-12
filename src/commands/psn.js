/**
 * Created by Liara Anna Maria Rørvig on 24/07/2017.
 */
'use strict';

const Colours = require( '../../lib/Colours.json' );
const Command = require( '../command.js' );
const dot     = require( 'dot-object' );

const NAME          = 'psn';
const HELP_SIMPLE   = 'Get\'s a user from PSN';
const HELP_DETAILED = 'Get\'s and displays you information about a user you want to lookup';
const CAN_RUN       = undefined;

class CommandPSN extends Command {
    constructor() {
        super( {
            name          : NAME,
            help_simple   : HELP_SIMPLE,
            help_detailed : HELP_DETAILED,
            can_run       : CAN_RUN
        } );
    }

    invoke( parameters, message, bot ) {
        let command_handler = ( resolve, reject ) => {
            let username = parameters[ 0 ];

            bot.psn.getProfile( parameters[ 0 ], ( error, profile_data ) => {
                if ( error ) {
                    console.log( error );

                    return reject( {
                        error   : true,
                        message : error.toString()
                    } );
                }


                let onlineId  = profile_data.onlineId;
                let panelBgc  = profile_data.panelBgc;
                let colour    = panelBgc ? parseInt( panelBgc.slice( panelBgc.length - 6 ), 16 ) : Colours.pink;
                let reactions = [
                    {
                        emoji : '🏆',
                        data  : {
                            action : 'GetTrophies',
                            data   : username
                        }
                    }
                ];
                let embed     = {
                    title       : onlineId + '\'s Profile',
                    description : profile_data.aboutMe,
                    color       : colour,
                    fields      : [
                        {
                            name   : 'Region',
                            value  : profile_data.region,
                            inline : true
                        },
                        {
                            name   : 'PS Plus',
                            value  : profile_data.plus === 1 ? 'Yes' : 'No',
                            inline : true
                        },
                        {
                            name   : 'Level',
                            value  : profile_data.trophySummary.level,
                            inline : true
                        },
                        {
                            name   : 'Progress',
                            value  : `${profile_data.trophySummary.progress}%`,
                            inline : true
                        },
                        {
                            name : 'Platinum', value : profile_data.trophySummary.earnedTrophies.platinum, inline : true
                        }, {
                            name : 'Gold', value : profile_data.trophySummary.earnedTrophies.gold, inline : true
                        }, {
                            name : 'Silver', value : profile_data.trophySummary.earnedTrophies.silver, inline : true
                        }, {
                            name : 'Bronze', value : profile_data.trophySummary.earnedTrophies.bronze, inline : true
                        }
                    ],
                    author      : {
                        name     : 'PlayStation Network',
                        url      : 'https://www.playstation.com/en-ca/network/',
                        icon_url : 'https://media.playstation.com/is/image/SCEA/navigation_home_ps-logo-us?$Icon$'
                    },
                    thumbnail   : {
                        url : dot.pick( 'personalDetail.profilePictureUrl', profile_data ) || profile_data.avatarUrl
                    }
                };

                if ( profile_data.relation === 'friend' ) {
                    embed.fields.push( {
                        name : 'Friends', value : 'Yes', inline : true
                    } );

                    reactions.push( {
                        emoji : '➗',
                        data  : {
                            action : 'RemoveFriend',
                            data   : username
                        }
                    } );
                } else if ( profile_data.relation === 'no relationship' || profile_data.relation === 'friend of friends' ) {
                    embed.fields.push( {
                        name : 'Friends', value : 'No', inline : true
                    } );

                    reactions.push( {
                        emoji : '➕',
                        data  : {
                            action : 'AddFriend',
                            data   : username
                        }
                    } );
                }

                if ( dot.pick( 'presence.primaryInfo.onlineStatus', profile_data ) === 'offline' ) {
                    embed.fields.push( {
                        name : 'Status', value : 'Offline', inline : true
                    } );
                    embed.fields.push( {
                        name   : 'Last Seen',
                        value  : new Date( profile_data.presence.primaryInfo.lastOnlineDate ).toUTCString(),
                        inline : true
                    } );
                } else if ( dot.pick( 'presence.primaryInfo.onlineStatus', profile_data ) === 'online' ) {
                    embed.fields.push( {
                        name : 'Status', value : 'Online', inline : true
                    } );
                }

                if ( dot.pick( 'presence.primaryInfo.gameTitleInfo.titleName', profile_data ) ) {
                    embed.fields.push( {
                        name   : 'Currently Playing',
                        value  : dot.pick( 'presence.primaryInfo.gameTitleInfo.titleName', profile_data ),
                        inline : true
                    } );
                }

                let response = {
                    error     : false,
                    message   : {
                        embed : embed
                    },
                    reactions : reactions,
                    no_delete : true
                };

                return resolve( response );
            } );
        };

        let promise = new Promise( command_handler );

        return promise;
    }

    reactionRemoveGetTrophies( parameters, message, bot ) {
        let username = parameters;
        bot.psn.getUserTrophies( 0, 10, username, ( error, trophies ) => {
            if ( error ) {
                return message.channel.send( error.toString() );
            }

            trophies = trophies.trophyTitles;

            trophies.forEach( trophy => {
                let title       = trophy.trophyTitleName;
                let description = trophy.trophyTitleDetail;
                let thumbnail   = trophy.trophyTitleIconUrl;
                let platform    = trophy.trophyTitlePlatfrom || 'Unknown';
                let colour      = Colours.pink;

                let embed = {
                    title       : title,
                    description : description,
                    color       : colour,
                    author      : {
                        name     : 'PlayStation Network',
                        url      : 'https://www.playstation.com/en-ca/network/',
                        icon_url : 'https://media.playstation.com/is/image/SCEA/navigation_home_ps-logo-us?$Icon$'
                    },
                    thumbnail   : {
                        url : thumbnail
                    },
                    fields      : [
                        {
                            name   : 'Platform',
                            value  : platform,
                            inline : true
                        }
                    ]
                };

                message.channel.send( {
                    embed : embed
                } );
            } );
        } );
    }

    reactionRemoveAddFriend( parameters, message, bot ) {
        let username = parameters;

        bot.psn.sendFriendRequest( username, '', ( error ) => {
            if ( error ) {
                return message.channel.send( error.toString() );
            }

            message.channel.send( 'Asynchronous Bot> Friend Request Sent' );
        } );
    }

    reactionRemoveRemoveFriend( parameters, message, bot ) {
        let username = parameters;

        bot.psn.removeFriend( username, ( error ) => {
            if ( error ) {
                return message.channel.send( error.toString() );
            }

            message.channel.send( 'Asynchronous Bot> Friend Removed' );
        } );
    }
}

module.exports = CommandPSN;