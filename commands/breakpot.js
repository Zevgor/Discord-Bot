const Discord = require('discord.js')

module.exports = {
    name: 'breakpot',
    run: async (client, message) => {
        const roles = client.guilds.cache
        .map((guild) => guild.roles.cache.map((role) => role))
        .flat();

        var i = roles.length
        while (i--)
        {
            if (!(roles[i].name).includes("Random"))
            {
                roles.splice(i, 1)
                continue
            }
            if(message.member.roles.cache.find(r => r.name === roles[i].name))
            {
                message.member.roles.remove(roles[i])
            }

        }

        var randomrole = roles[Math.floor(Math.random()*roles.length)];
        message.channel.send('You ran BreakPot and got the role: '+ randomrole.name);
        message.member.roles.add(randomrole);
        }
}