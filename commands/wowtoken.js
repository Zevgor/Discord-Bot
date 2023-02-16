const FormData = require('form-data');
const axios = require('axios');

module.exports = {
    name: 'wowtoken',
    aliases: ['wt'],
    run: async (client, message) => {
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
        })
		//catch Battle.net OAUTH Errors
		.catch(function (error) {
			console.log(error);
		})
    }
}



		return;
