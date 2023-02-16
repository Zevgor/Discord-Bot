module.exports = {
    name: 'nuke',
    run: async (client, message) => {
        message.channel.messages.fetch({limit: 100})
        .then(function(list){
            message.channel.bulkDelete(list,true);
        }, function(err){message.channel.send("ERROR: ERROR CLEARING CHANNEL.")})
        .catch(console.error)
    }
}