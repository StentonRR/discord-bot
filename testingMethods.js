const Yuko = require("./Yuko.js")
const commands = require("./controllers/commandController.js");
const util = require('util');

module.exports = {
    log: msg => {
      if(typeof msg == "object") msg = util.inspect(msg);
      Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.log_channel).send(`@here \n${msg}`);
    },

    embed: msgObj => {
        Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.log_channel).send(msgObj);
    },

    errorLog: msg => {
        Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.error_channel).send("---------------------------------------------------------------------------------------------------------");

        if(msg.length > 2000){
           console.log(msg);
           return Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.error_channel).send("Error too long....logged to console");
        }

        if(typeof msg == Object){
          Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.error_channel).send(`@here\n${JSON.stringify(msg)}`);
        }else{
          Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.error_channel).send(`@here\n${util.inspect(msg)}`);
        }
        Yuko.bot.guilds.get(Yuko.settings.test_server).channels.get(Yuko.settings.error_channel).send("---------------------------------------------------------------------------------------------------------");
    }
}
