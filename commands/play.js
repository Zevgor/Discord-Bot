module.exports = {
    name: 'play',
    run: async(client,message) => {
        client.distube
			.play(message.member.voice.channel, args.join(' '), {
				message,
				textChannel: message.channel,
				member: message.member,
			})
			.catch(err => {
				message.reply(err.message);
			});
            message.channel.send('Now Playing '+args.join(' '))
    }
}