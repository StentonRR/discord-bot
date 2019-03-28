var jsonMan = require("./jsonMan.js");
const dataProvider = require('./dataProvider.js');
const util = require('util');

module.exports = {

  toggleOption: async(option, toggle, message, channel) => {

    try{
      if(toggle && message.guild.channels.find(x => x.name === channel) === null){message.reply("Channel doesn't exist"); return;}

      await dataProvider.custom(`UPDATE servers SET ${option}bool = ${toggle}, ${option}channel = '${channel}' WHERE id = '${message.guild.id}'`);

      message.reply(`${option} has been toggled to ${toggle}`);
    }catch(err){
      console.log(util.inspect(err));
    }

  }
}

//EX: toggleOption("welcomer", false, message, "welcome-channel")
