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

let token = auth.test ? auth.testToken : auth.token;
exports.bot.login(token);


//process.on('unhandledRejection', console.error);

exports.bot.on("ready", async() => {
		let t = await dataProvider.custom(`SELECT * FROM settings WHERE my_id = '${exports.bot.user.id}'`);
		exports.settings = t.rows[0];

		var bdayServ = schedule.scheduleJob('0 7 * * *', () => {commandController.checkbdayservice()});


	  console.log("Starting.....");
	  console.log("I am ready!");
		exports.bot.user.setPresence({game:{name: 'Granting Wishes', type: 0}});
	});


exports.bot.on("guildMemberAdd", async member => {
	try{
		let guild = member.guild;

		// Add guild to database if it doesn't exist
		if ( !(await dataProvider.verifyGuild(guild.id)) ) await dataProvider.addGuild(guild.id, guild.name);

		return commandController.welcome(member, guild);
	}catch(err){
		console.log(err);
		test.log(err);
	}
}); //END OF NEW MEMBER HANDLER


exports.bot.on("guildCreate", async guild => {
		try{
			dataProvider.addGuild(guild.id, guild.name);
			test.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
			console.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
});//END OF JOINING NEW GUILD HANDLER


exports.bot.on("presenceUpdate", async (oldMember, newMember) => {
    try{
			// Add guild to database if it doesn't exist
			if ( !(await dataProvider.verifyGuild(newMember.guild.id)) ) {
				 await dataProvider.addGuild(newMember.guild.id, newMember.guild.name);
			}

		  presenceController.evaluateRole(oldMember, newMember);
		}catch(err){
			console.log(err);
			test.errorLog("Error: " + err);
		}
    return;
}); //END OF PRESENCE UPDATE HANDLER


exports.bot.on('message', async message => {
	try{
		if(message.guild == null && message.author.id != exports.settings.myId){
			message.reply(`I'm not a fan of one on ones~~ Please call upon me within a server`);
			return test.log(`Non-guild message: \nUser: ${message.author.username} (${message.author.id})\nContent: ${message.content}`)
		}
		if(message.author.bot) return;
		if(!message.content.startsWith(exports.settings.prefix)) return;

		// Add guild to database if it doesn't exist
		if ( !(await dataProvider.verifyGuild(message.guild.id)) ) {
			dataProvider.addGuild(message.author.guild.id, message.author.guild.name);
		}

		commandController.command(message);
	}catch(err){
		console.log(err);
		test.errorLog(err);
	}
}); //END MESSAGE HANDLER


exports.bot.on('messageDelete', async message => {
	if(message.guild.id == exports.settings.testServer) return;
	exports.bot.guilds.get(exports.settings.testServer).channels.get(exports.settings.dumpSettings).send(`User: ${message.author.username} (${message.author.id})\nGuild: ${message.guild.name}\nChannel: ${message.channel.name}\nContent:\n${message.content}`);
}); //END MESSAGE DELETE HANDLER


exports.bot.on('error', err => {
	console.error;
	test.errorLog(JSON.stringify(err));
	test.errorLog(util.inspect(err));
}); //END ERROR HANDLER
