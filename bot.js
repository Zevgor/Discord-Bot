require('dotenv').config();

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

//config file load variables
client.config = require('./config.json')
const prefix = client.config.prefix;
const botchan = client.config.bot_channel;

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

//load command list
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

//ready message
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


//message listener
client.on('messageCreate', message => {
	//ignore self 
	if (message.author.bot || !message.guild) return

	// console.log(message.channel)
	// console.log(message.channel.name)

	//ignore anything not starting with prefix
    // const prefix = client.config.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot)
		return;

	//make sure bot command message is in configured bot-channel, except for the .nuke command
	if (message.channel.name != botchan && !(message.content.startsWith(".nuke"))) {
		message.channel.send({ content: 'Bot commands must be sent in the channel: '+botchan , ephemeral: true }).then(msg=>{
			setTimeout(() => msg.delete(), 5000)
		})
		message.delete({ timeout:5000 })
		return
	}

	//parse command and confirm it is valid
	const args = message.content.slice(prefix.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()
	const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
	if (!cmd) {
		message.reply("Invalid Command!")
		return
	}
	if (cmd.inVoiceChannel && !message.member.voice.channel) {
		return message.channel.send(`${client.emotes.error} | You must be in a voice channel!`)
	}
	try {
		cmd.run(client, message, args)
	} catch (e) {
		console.error(e)
		message.channel.send(`${client.emotes.error} | Error: \`${e}\``)
	}
});

//distube status queue
const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``


//distube state tracking
client.distube
.on('playSong', (queue, song) =>
	queue.textChannel.send(
		`${client.emotes.play} Playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
		// `${client.emotes.play} | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
	)
)
.on('addSong', (queue, song) =>
	queue.textChannel.send(`${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`)
)
.on('addList', (queue, playlist) =>
	queue.textChannel.send(`${client.emotes.success} | Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`)
)
.on('error', (channel, e) => {
	if (channel) channel.send(`${client.emotes.error} An error encountered: ${e.toString().slice(0, 1974)}`)
	else console.error(e)
}
)
.on('searchNoResult', (message, query) =>
	message.channel.send(`${client.emotes.error} No result found for \`${query}\`!`)
)
.on('finish', queue => queue.textChannel.send('No additional songs in queue.'));

//log in to bot
client.login(process.env.BOT_TOKEN)