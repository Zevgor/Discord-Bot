require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands = ['!wowtoken', '!wowarmory','!nuke']

client.on('ready', () => {
    console.log('Bot is ready');
});

client.on('messageCreate', (msg) => {
    if (msg.author.bot || msg.content.startsWith("!") == false) return;

    if (commands.includes(msg.content) == false){
        msg.reply('Invalid Command!')
        return;
    }

    // Send back a reply when the specific command has been written by a user.
    // if (msg.content === '!hello') {
    //     msg.reply('Hello World!')
    // }

    //WoW Commands
    if (msg.content.startsWith("!wow")){
        let data = new FormData();
        data.append('grant_type','client_credentials');
        var bnetoauth = {
            method: 'post',
            url: 'https://us.battle.net/oauth/token',
            headers: { 
                'Authorization': 'Basic ' + Buffer.from(process.env.BATTLENET_CLIENT+':'+process.env.BATTLENET_SECRET).toString('base64'),
                ...data.getHeaders()
            },
            data : data
        }
        axios(bnetoauth)
        .then(function (response) {
        let authtoken = response.data.access_token
        //Battle.net Authentication access token retrieved

            //WoW Token Price request
            if(msg.content.startsWith("token",4)){
                //console.log(JSON.stringify(response.data));
                let tokenreq = {
                    method: 'get',
                    url: 'https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us',
                    headers: { 
                    'Authorization': 'Bearer '+authtoken
                    }
                }
                axios(tokenreq)
                .then(function (response) {
                    var amt = response.data.price.toString()
                    msg.reply("Current WoW Token Price is " + String((amt.substr(0,amt.length-4))).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
                })
                .catch(function (error) {
                    console.log(error);
                })
            }

            //WoW Armory request
            if(msg.content.startsWith("armory",4)){
                msg.reply("WoW Armory Request is currently in development!")
            }

            })
        //catch Battle.net OAUTH Errors
        .catch(function (error) {
            console.log(error);
        })
    }
    
    //Nuke Messages
    if (msg.content === '!nuke') {
        if (msg.member.permissions.has("MANAGE_MESSAGES")) {
            msg.channel.messages.fetch({limit: 100})
            .then(function(list){
                    msg.channel.bulkDelete(list,true);
            }, function(err){msg.channel.send("ERROR: ERROR CLEARING CHANNEL.")})
            .catch(console.error)
        }
        else {
            msg.reply("You don't seem to have permissions to manage messages.")
        }
    }
})

client.login(process.env.BOT_TOKEN)