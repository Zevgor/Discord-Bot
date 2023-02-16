require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');

const { DisTube } = require('distube')
const Discord = require('discord.js')
const client = new Discord.Client({
	intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent
	]
})

const fs = require('fs')
const config = require('./config.json')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')

client.config = require('./config.json')
client.distube = new DisTube(client, {
	leaveOnStop: false,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	plugins: [
    new SpotifyPlugin({
	emitEventsAfterFetching: true
    }),
    new SoundCloudPlugin(),
    new YtDlpPlugin()
	]
})
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.emotes = config.emoji

fs.readdir('./commands/', (err, files) => {
	if (err) return console.log('Could not find any commands!')
		const jsFiles = files.filter(f => f.split('.').pop() === 'js')
		if (jsFiles.length <= 0) return console.log('Could not find any commands!')
	jsFiles.forEach(file => {
	const cmd = require(`./commands/${file}`)
	console.log(`Loaded ${file}`)
    client.commands.set(cmd.name, cmd)
    if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name))
	})
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


//message listener
client.on('messageCreate', message => {
//ignore self and validate processing a command
	if (message.author.bot || !message.guild) return
    const prefix = client.config.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot)
		return;

		//parse command and confirm it is valid
		const args = message.content.slice(prefix.length).trim().split(/ +/g)
		const command = args.shift().toLowerCase()
		const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
		if (!cmd) {
			message.reply("Invalid Command!")
			return
		}
		
	if (command === 'ping') message.reply("Pongerino!")

	if (command === 'play')
		client.distube
			.play(message.member.voice.channel, args.join(' '), {
				message,
				textChannel: message.channel,
				member: message.member,
			})
			.catch(err => {
				message.reply(err.message);
			});
	
	if (command.startsWith("wow")){
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
			if(message.content.startsWith("token",4)){
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
					message.reply("Current WoW Token Price [US] is " + String((amt.substr(0,amt.length-4))).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
				})
				.catch(function (error) {
					console.log(error);
				})
			}

			//WoW Armory request
			if(message.content.startsWith("armory",4)){
				message.reply("WoW Armory Request is currently in development!")
			}

			})
		//catch Battle.net OAUTH Errors
		.catch(function (error) {
			console.log(error);
		})
		return;
	}
		
	if (command === 'nuke')
		if (message.member.permissions.has("MANAGE_MESSAGES")) {
			message.channel.messages.fetch({limit: 100})
			.then(function(list){
				message.channel.bulkDelete(list,true);
			}, function(err){message.channel.send("ERROR: ERROR CLEARING CHANNEL.")})
			.catch(console.error)
		}
		else {
			message.reply("You don't seem to have permissions to manage messages.")
		}
	return;
});


client.login(process.env.BOT_TOKEN)