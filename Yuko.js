const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const auth = require("./auth.json");
//const bday = require("./bday.json");
const Music = require("./music.js");
const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
//const opus = require('node-opus');
const commandController = require('./commandController.js');
const presenceController = require('./presenceController.js');
const jsonMan = require('./jsonMan.js');
const test = require('./testingMethods.js');
const util = require('util');
const dataProvider = require('./dataProvider.js');
const schedule = require('node-schedule');


bot.login(auth.token);

//process.on('unhandledRejection', console.error);

bot.on("ready", () => {
	  console.log("Starting.....");
		auth.bot = bot;
	  console.log("I am ready!");
		bot.user.setPresence({game:{name: 'Granting Wishes', type: 0}});
	});


	// const music = new Music(bot, {
	// 	youtubeKey: ' AIzaSyD0_W-cAYnjvNi13WqFiTQB8vBd4papcFE ',
	// 	prefix: auth.prefix,       // Prefix for the commands.
	// 	global: false,         // Non-server-specific queues.
	// 	maxQueueSize: 25,     // Maximum queue size of 25.
	// 	clearInvoker: true,   // If permissions applicable, allow the bot to delete the messages that invoke it.
	// 	helpCmd: 'mhelp',     //Sets the name for the help command.
	// 	playCmd: 'play',     //Sets the name for the 'play' command.
	// 	skipCmd: 'skip',
	// 	volumeCmd: 'volume',  //Sets the name for the 'volume' command.
	// 	anyoneCanAdjust: true,
	// 	anyoneCanSkip: true,
	// 	leaveCmd: 'leave',    //Sets the name for the 'leave' command.
	// 	disableLoop: true,
	// 	logging: true
	// });





bot.on("guildMemberAdd", member =>{
	try{
		let guild = member.guild;

		return commandController.welcome(member, guild);
	}catch(err){
		console.log(err);
		test.log(err);
	}
}); //END OF NEW MEMBER HANDLER





bot.on("guildCreate", guild =>{
		try{
			dataProvider.custom(`INSERT INTO servers (id, name) VALUES ('${guild.id}', '${guild.name}')`);
			test.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
			console.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
});//END OF JOINING NEW GUILD HANDLER


bot.on("presenceUpdate", (oldMember, newMember) => {

    try{
		  presenceController.evaluateRole(oldMember, newMember);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
    return;
}); //END OF PRESENCE UPDATE HANDLER


bot.on('message', (message) => {
	try{
		if(message.guild == null && message.author.id != auth.myId){
			message.reply(`I'm not a fan of one on ones~~ Please call upon me within a server`);
			return test.log(`Non-guild message: \nUser: ${message.author.username} (${message.author.id})\nContent: ${message.content}`)
		}
		if(message.author.bot) return;
		if(!message.content.startsWith(auth.prefix)) return;

		commandController.command(message);
	}catch(err){
		console.log(err);
		test.errorLog(err);
	}
}); //END MESSAGE HANDLER


bot.on('messageDelete', (message) => {
	if(message.guild.id == auth.testServer) return;
	bot.guilds.get("341746752409567242").channels.get("531331487442665511").send(`User: ${message.author.username} (${message.author.id})\nGuild: ${message.guild.name}\nChannel: ${message.channel.name}\nContent:\n${message.content}`);
}); //END MESSAGE DELETE HANDLER


//
// //functions
//
// //Checks for birthdays every 24 hours
// const birthday = () => {
// 	setInterval(function(){checkBirth();}, 86400000);
// }

//Checks if someone's birthday is today and notifies server if service is true
// const checkBirth = () => {
//
// 			    let obj1 = jsonMan.read("bday.json");
// 					let obj2 = jsonMan.read("servers.json");
// 					let date = new Date();
// 					let month = date.getMonth();
// 					let day = date.getDate();
//
// 					for(var server in obj2){
// 						if(!obj2[server]["bday"][0]){continue;}
//
// 						for (var dude in obj1){
// 							if(typeof bot.guilds.get(server).members.get(dude) === "undefined"){continue;}
//
// 							if(month === parseInt(obj1[dude][0])){
// 								if(day === parseInt(obj1[dude][1])){
// 									bot.guilds.get(server).channels.find("name",obj2[server]["bday"][1]).send(`@everyone HAPPY BIRTHDAY ${bot.users.get(dude).username}`);
// 								}
// 							}
// 						}
// 				}
// 		}

bot.on('error', (err) => {
	console.error;
	test.errorLog(JSON.stringify(err));
	test.errorLog(util.inspect(err));
});





//Test method
const tester = (message) => {

	checkGlitch(message.guild.id, message.author);
	}





// var tick;
//
// const stop = () => {
// 	clearInterval(tick);
// }
//
// const announce = (msg, inter, message) =>{
// 	tick = setInterval(function(){message.channel.send(msg);}, inter);
// }
//
// const notify = (msg, chan) =>{
// 	chan.send(msg);
// }

//Adds new server to the database
const newServer = (serv) =>{
		let obj = jsonMan.read("servers.json");
		obj[serv] = {
			"bday":[false, ""],
			"streamlink":[false, ""],
		  "welcomer":[false, ""]
		};

		jsonMan.write("servers.json", obj);
		delete require.cache[require.resolve('./servers.json')];
		servers = require("./servers.json");
}



const tOutput = (text, person) =>{
	return console.log("TEST TRIGGERED:\n\n---------------------------------------\n" + `OUTCOME: For ${person.username}: ` + text + "\n---------------------------------------");
}


//Services

//var bdayServ = schedule.scheduleJob('0 7 * * *', commandController.checkbdayservice());
var bdayServ = schedule.scheduleJob('0 7 * * *', () => {commandController.checkbdayservice()});










//inet
const initializeRoles = () => {

	let serverObject = jsonMan.read('servers.json');
	let peopleCol;
	let guild;

	for(var server in serverObject){
		  guild = bot.guilds.get(server);
			peopleCol = guild.members;

			for(var person in peopleCol){
				let playRole1 = guild.roles.find(x => x.name === "Playing Overwatch");
				let playRole2 = guild.roles.find(x => x.name === "Streaming");
				let playRole3 = guild.roles.find(x => x.name === "Bots");
				let playRole4 = guild.roles.find(x => x.name === "Playing Fortnite");

					if(playRole1){
									if((person.presence.game == null || person.presence.game.name != "Overwatch") && person.roles.has(playRole1.id)){
										person.removeRole(playRole1);
									}

									if(person.presence.game != null){
											 if(person.presence.game.name === "Overwatch"){
															person.addRole(playRole1);
											 }
									}
					}


					if(playRole2){
								if((person.presence.game == null || person.presence.game.type != 1 || !person.presence.game.streaming) && person.roles.has(playRole2.id)){
											 person.removeRole(playRole2);
											 removeStream(person.user);
								}

								if(person.presence.game != null){
											if(person.presence.game.type == 1){
															person.addRole(playRole2);
											}
									}
					}


					if(playRole4){
								if((person.presence.game == null || person.presence.game.name != "Fortnite") && person.roles.has(playRole4.id)){
									person.removeRole(playRole4);
								}

								if(person.presence.game != null){
										 if(person.presence.game.name === "Fortnite"){
														person.addRole(playRole4);
										 }
								}
				}

			}
  }
}
