const auth = require("./auth.json");
const commands = require("./commandController.js");
const util = require('util');

module.exports = {
    log: function(msg){
      auth.bot.guilds.get("341746752409567242").channels.get("445740740836851713").send(`@here \n${msg}`);
    },

    embed: (msgObj) => {
        auth.bot.guilds.get("341746752409567242").channels.get("445740740836851713").send(msgObj);
    },

    errorLog: function(msg){

        auth.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("---------------------------------------------------------------------------------------------------------");

        if(msg.length > 2000){
           console.log(msg);
           return auth.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("Error too long....logged to console");
        }

        if(typeof msg == Object){
          auth.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send(`@here\n${JSON.stringify(msg)}`);
        }else{
          auth.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send(`@here\n${util.inspect(msg)}`);
        }
        auth.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("---------------------------------------------------------------------------------------------------------");
    }
}
