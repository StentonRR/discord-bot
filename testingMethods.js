const Yuko = require("./Yuko.js")
const commands = require("./controllers/commandController.js");
const util = require('util');

module.exports = {
    log: msg => {
      if(typeof msg == "object") msg = util.inspect(msg);
      Yuko.bot.guilds.get("341746752409567242").channels.get("445740740836851713").send(`@here \n${msg}`);
    },

    embed: msgObj => {
        Yuko.bot.guilds.get("341746752409567242").channels.get("445740740836851713").send(msgObj);
    },

    errorLog: msg => {
        Yuko.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("---------------------------------------------------------------------------------------------------------");

        if(msg.length > 2000){
           console.log(msg);
           return Yuko.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("Error too long....logged to console");
        }

        if(typeof msg == Object){
          Yuko.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send(`@here\n${JSON.stringify(msg)}`);
        }else{
          Yuko.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send(`@here\n${util.inspect(msg)}`);
        }
        Yuko.bot.guilds.get("341746752409567242").channels.get("447838816041041924").send("---------------------------------------------------------------------------------------------------------");
    }
}
