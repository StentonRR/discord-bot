const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require("./auth.json");

bot.login(auth.token);


bot.on("ready", () => {
	  console.log("I am ready!");
	});




bot.on("guildMemberAdd", member =>{
	let guild = member.guild;
	return guild.defaultChannel.send(`Welcome ${member.user.toString()} to this server.
		 Remember everything isn't as it seems and many here are prone to flights of fancy. \n
		 What describes you the most: Viewer(Known here as part of the 'Army') or Streamer?
		  Please state "who [Army or YouTuber/Streamer]" Ex: "/who YouTuber/Streamer"`)
});





bot.on("guildCreate", guild =>{
	console.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`)
});





bot.on("presenceUpdate", (oldMember, newMember) => {
	let guild = newMember.guild;
	let playRole = guild.roles.find("name", "Playing Overwatch");
	if(!playRole) return;
	if(newMember.user.presence.game && newMember.user.presence.game.name === "Overwatch"){
		return newmember.addRole(playRole);
	}else if(!newMember.user.presence.game && newMember.roles.has(playRole.id)){
		return newMember.removeRole(playRole);
	}
});


bot.on('message', (message) => {
		if(message.author.bot) return;
		if(!message.content.startsWith(auth.prefix)) return;


		let command = message.content.split(" ")[0];
		command = command.slice(auth.prefix.length)

		let args = message.content.split(" ").slice(1);

		
		if(command === "hello" || "hi" || "hey"){
			return message.reply("Greetings~", { 
				file: "https://49.media.tumblr.com/28660f1f4bda9017b148160a6855a68e/tumblr_n5gptk6Fep1qba9qlo3_r1_500.gif"
			}).catch(console.error);
		}	
		
		if(command === "who"){
			let position = args[0];
			position = position.charAt(0).toUpperCase() + position.slice(1);
			let place = message.guild.roles.find("name", position);
			if(!place){
				return message.reply("There is no such position").catch(console.error);
			}
			
			if(message.member.roles.has(place.id)){
				return message.reply("You are already known here").catch(console.error);
			}else{
				message.member.addRole(place).catch(console.error);
				message.reply(`You are now a/n ${place} member`);

				}
			}
		


		if(command === "say"){
			return message.channel.send(args.join(" "));
		}

		if(command === "add"){
			let numArray = args.map(n=> parseInt(n));
			let total = numArray.reduce( (p,c) => p+c);
				return message.channel.send(total);
		}

		if(command === "foo"){
			let modRole = message.guild.roles.find("name","Halp");
			if(message.member.roles.has(modRole.id)){
				return message.channel.send("bar!");
		}else{
			return message.reply("I don't answer to the likes of you").catch(console.error);  /*can be put anywhere it can fail---only ones that use Discord.js*/
		}
	}


		if(command === "kick"){
			let modRole = message.guild.roles.find("name","Halp");
			if(!message.member.roles.has(modRole.id)){
				return message.reply("I don't answer to the likes of you");
			}

			if(message.mentions.users.size === 0){
				return message.reply("I can't expel without a name");
			}
			let kickMember = message.guild.member(message.mentions.users.first());
			if(!kickMember){
				return message.reply("I know no such person");
			}
			if(!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")){
				return message.reply("I have no such power");
			}
			kickMember.kick().then(member => {
				return message.reply(`${member.user.username} was expelled`)
			}).catch(e => {
				console.error(e);
			});
		}



		if(command === "ping"){
			return message.channel.send("pong");
		}


	/*	if (command === "eval") {
			if(!message.author.id !== "237358931251429398") return;
			try {
				var code = args.join(" ");
				var evaled = eval(code);

				if(typeof evaled !== "string")
					evaled = require("util").inspect(evaled);


				message.channel.sendCode("x1", clearn(evaled));
			}catch(err) {
				message.channel.send(`\`ERROR\` \`\`\`x1\n${clean(err)}\n\`\`\``);
			}
		}
*/



}); //END MESSAGE HANDLER

function clean(text) {
	if (typeof(text) === "string"){
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
}else{
	return text;
}
}
