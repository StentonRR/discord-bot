const Yuko = require("../Yuko.js");
const toggleOption = require("../toggleOption.js");
const jsonMan = require("../jsonMan.js");
const test = require("../testingMethods.js");
const util = require('util');
const imaging = require('../imaging.js');
const dataProvider = require('../dataProvider.js');
const fs = require('fs');

const commands = require('../command.js');

module.exports = {

 command: message => {

   try{
			let command = message.content.split(" ")[0];
			command = command.slice(Yuko.settings.prefix.length)

			let args = message.content.split(" ").slice(1);

			let guild = message.guild;
			let id = message.member.user.id;

      if(!commands[command]) return message.reply('No such command exists~');
      if(!commands[command].authorization(id, guild)) return message.reply("You are not authorized to use this command!");
      if(!commands[command].requirement(args, message)) return message.reply("Incorrect syntax!");

      return commands[command].function(message, args, guild, id);

		}catch(err){
			console.log(err);
			test.errorLog(err);
		}
	},

  //Checks if server has welcomer enabled and sends message if true
  welcome: async (member, guild) => {
    try{
      let data = await dataProvider.custom(`SELECT welcomerbool, welcomerchannel FROM servers WHERE id = '${guild.id}'`);

      if(data.rows[0].welcomerbool){
          Yuko.bot.guilds.get(guild.id).owner.user.send(`${member.user.username} has joined ${guild.name}!`);

          return Yuko.bot.guilds.get(guild.id).channels.get(data.rows[0].welcomerchannel).send(`Welcome ${member.toString()} to this server.
                 Remember everything isn't as it seems and many here are prone to flights of fancy.`);
      }

    }catch(err){
      console.log(err);
      test.errorLog(`Error with welcomer...... member: ${member} \n guild: ${guild}`);
    }
  },

  //checks if there is a birthday on the current day
  checkbdayservice: async() => {
    try{
      let date = new Date();
      date.setFullYear(2000);
      date = date.toDateString();

      let bdayData = await dataProvider.custom(`SELECT id, guild FROM bday WHERE bdaydate = '${date}'`);

      if(bdayData.rows.length == 0) return;

      let serverData = await dataProvider.custom(`SELECT id, bdaybool, bdaychannel FROM servers`);
      let info = {};

      for(let row of serverData.rows){
        info[row.id] = {'bdaybool': row.bdaybool, 'bdaychannel': row.bdaychannel};
      }

      for(let row of bdayData.rows){

        if(info[row.guild].bdaybool){
          Yuko.bot.guilds.get(row.guild).channels.get(info[row.guild].bdaychannel).send(`:confetti_ball: :confetti_ball:@here LETS ALL WISH ${Yuko.bot.guilds.get(row.guild).members.get(row.id).toString()} A HAPPY BIRTHDAY!!!!:confetti_ball: :confetti_ball: `, {
                                   files: ["./pics/birthday.png"]
                                 });
        }
      }
    }catch(e){
      test.errorLog(e);
    }

  }
};
