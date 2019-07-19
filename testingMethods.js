const Yuko = require("./Yuko.js")
const commands = require("./controllers/commandController.js");
const util = require('util');

module.exports = {
    log: msg => {
      if(typeof msg == "object") msg = util.inspect(msg);
      Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.logChannel).send(`@here \n${msg}`);
    },

    embed: msgObj => {
        Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.logChannel).send(msgObj);
    },

    errorLog: msg => {
        Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.errorChannel).send("---------------------------------------------------------------------------------------------------------");

        if(msg.length > 2000){
           console.log(msg);
           return Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.errorChannel).send("Error too long....logged to console");
        }

        if(typeof msg == Object){
          Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.errorChannel).send(`@here\n${JSON.stringify(msg)}`);
        }else{
          Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.errorChannel).send(`@here\n${util.inspect(msg)}`);
        }
        Yuko.bot.guilds.get(Yuko.settings.testServer).channels.get(Yuko.settings.errorChannel).send("---------------------------------------------------------------------------------------------------------");
    }
}
