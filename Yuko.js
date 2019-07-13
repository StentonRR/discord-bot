const Discord = require('discord.js');
exports.bot = new Discord.Client();
const fs = require('fs');
const auth = require("./auth.json");
const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const commandController = require('./controllers/commandController.js');
const presenceController = require('./controllers/presenceController.js');
const jsonMan = require('./jsonMan.js');
const test = require('./testingMethods.js');
const util = require('util');
const dataProvider = require('./dataProvider.js');
const schedule = require('node-schedule');

exports.settings;


exports.bot.login(auth.token);


//process.on('unhandledRejection', console.error);

exports.bot.on("ready", async() => {
		let t = await dataProvider.custom(`SELECT * FROM settings WHERE "myId" = '${exports.bot.user.id}'`);
		exports.settings = t.rows[0];


		var bdayServ = schedule.scheduleJob('0 7 * * *', () => {commandController.checkbdayservice()});


	  console.log("Starting.....");
	  console.log("I am ready!");
		exports.bot.user.setPresence({game:{name: 'Granting Wishes', type: 0}});
	});


exports.bot.on("guildMemberAdd", member =>{
	try{
		let guild = member.guild;

		return commandController.welcome(member, guild);
	}catch(err){
		console.log(err);
		test.log(err);
	}
}); //END OF NEW MEMBER HANDLER


exports.bot.on("guildCreate", guild =>{
		try{
			dataProvider.custom(`INSERT INTO servers (id, name) VALUES ('${guild.id}', '${guild.name}')`);
			test.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
			console.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
});//END OF JOINING NEW GUILD HANDLER


exports.bot.on("presenceUpdate", (oldMember, newMember) => {

    try{
		  presenceController.evaluateRole(oldMember, newMember);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
    return;
}); //END OF PRESENCE UPDATE HANDLER


exports.bot.on('message', (message) => {
	try{
		if(message.guild == null && message.author.id != exports.settings.myId){
			message.reply(`I'm not a fan of one on ones~~ Please call upon me within a server`);
			return test.log(`Non-guild message: \nUser: ${message.author.username} (${message.author.id})\nContent: ${message.content}`)
		}
		if(message.author.bot) return;
		if(!message.content.startsWith(exports.settings.prefix)) return;

		commandController.command(message);
	}catch(err){
		console.log(err);
		test.errorLog(err);
	}
}); //END MESSAGE HANDLER


exports.bot.on('messageDelete', (message) => {
	if(message.guild.id == exports.settings.testServer) return;
	exports.bot.guilds.get("341746752409567242").channels.get("531331487442665511").send(`User: ${message.author.username} (${message.author.id})\nGuild: ${message.guild.name}\nChannel: ${message.channel.name}\nContent:\n${message.content}`);
}); //END MESSAGE DELETE HANDLER


exports.bot.on('error', (err) => {
	console.error;
	test.errorLog(JSON.stringify(err));
	test.errorLog(util.inspect(err));
}); //END ERROR HANDLER
