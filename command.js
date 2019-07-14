const Discord = require('discord.js');
const toggleOption = require("./toggleOption.js");
const presenceController = require('./controllers/presenceController.js');
const commandController = require('./controllers/commandController.js');
const presence = require('./presence.js');
const jsonMan = require("./jsonMan.js");
const Yuko = require("./Yuko.js");
const authorization = require("./authorization.js");
const test = require("./testingMethods.js");
const testObjects = require("./testObjects.js");
const util = require('util');
const imaging = require('./imaging.js');
const dataProvider = require('./dataProvider.js');
const fs = require('fs');
const requests = require('./requests.js');
const fetch = require("node-fetch");

module.exports = {

  bday: {
    description: "Adds birthday to notification list",
    usage: "y/bday <month number> <day number>",
    authorization: (id, guild, lvl='rune') => {
      return authorization.authorize(id, guild, lvl);
    },
    requirement: (args) => {
      return args.length == 2 && !isNaN(args[1]) && args[1] < 31 && args[1] > 0 && !isNaN(args[0]) && args[0] < 12 && args[0] > 0;
    },
    function: async(message, args, guild, id) => {

      let day = args[1];
      let month = args[0];

      let date = new Date(2000, month-1, day);

      date = date.toDateString();

      let data = await dataProvider.custom(`SELECT bdaydate FROM bday WHERE id = '${message.author.id}' AND guild = '${guild.id}'`);

      if(data.rows.length != 0){

        if(data.rows[0].bdaydate != date){
          await dataProvider.custom(`UPDATE bday SET bdaydate = '${date}' WHERE id = '${message.author.id}' AND guild = '${guild.id}'`);
          return message.reply("Birthday updated");
        }else{
          return message.reply("Birthday already recorded");
        }
      }else{
        await dataProvider.custom({name: 'create-bday', text: `INSERT INTO bday (id, bdaydate, guild) VALUES ($1, $2, $3)`, values: [`${message.author.id}`, `${date}`, `${guild.id}`] });
        return message.reply("Birthday successfully added").catch(console.error);
      }
    }
  },

  allbdays: {
    description: "See all bdays for server",
    usage: "y/allbdays",
    authorization: (id, guild, lvl='rune') => {
      return authorization.authorize(id, guild, lvl);
    },
    requirement: (args) => {
      return args.length == 0;
    },
    function: async(message, args, guild, id) => {
      try{
        let data = await dataProvider.custom(`SELECT id, bdaydate FROM bday WHERE guild = '${guild.id}'`);

        let result = `\n`;

        for(let row of data.rows){
          result += `${Yuko.bot.guilds.get(guild.id).members.get(row.id).user.username}'s birthday is ${row.bdaydate.getMonth() + 1}/${row.bdaydate.getDate()}\n`;
        }

        message.reply(result);
      }catch(err){
        test.errorLog(err);
      }
    }
  },

  addbday: {
    description: "Adds birthday to database",
    usage: "y/addbday <user id> <month number> <day number>",
    authorization: (id, guild, lvl='rune') => {
      return authorization.authorize(id, guild, lvl);
    },
    requirement: (args) => {
      return args.length == 3 && !isNaN(args[2]) && args[2] < 32 && args[2] > 0 && !isNaN(args[1]) && args[1] < 13 && args[1] > 0;
    },
    function: async(message, args, guild, id) => {

      let day = args[2];
      let month = args[1];

      let date = new Date(2000, month-1, day);

      date = date.toDateString();

      let data = await dataProvider.custom(`SELECT bdaydate FROM bday WHERE id = '${args[0]}' AND guild = '${guild.id}'`);

      if(data.rows.length != 0){

        if(data.rows[0].bdaydate != date){
          await dataProvider.custom(`UPDATE bday SET bdaydate = '${date}' WHERE id = '${args[0]}' AND guild = '${guild.id}'`);
          return message.reply("Birthday updated");
        }else{
          return message.reply("Birthday already recorded");
        }
      }else{
        await dataProvider.custom({name: 'create-bday', text: `INSERT INTO bday (id, bdaydate, guild) VALUES ($1, $2, $3)`, values: [`${args[0]}`, `${date}`, `${guild.id}`] });
        return message.reply("Birthday successfully added").catch(console.error);
      }
    }
  },

  setBdays: {
      description: "Enables birthday notification",
      usage: "y/setBdays <text channel name>",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args, msg) => {
        return msg.guild.channels.find(x => x.name === args[0]) ? true : false;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("bday", true, message, guild.channels.find(x => x.name === args[0]).id);
      }
  },

  bdaysOff: {
      description: "Disable birthday notification",
      usage: "y/bdaysOff",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return args.length == 0;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("bday", false, message, "");
      }
  },


  setStreamLinks: {
      description: "Enable streaming notifications",
      usage: "y/setStreamLinks <text channel name>",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args, msg) => {
        return msg.guild.channels.find(x => x.name === args[0]) ? true : false;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("streamlink", true, message, guild.channels.find(x => x.name === args[0]).id);
      }
  },

  streamLinksOff:  {
      description: "Disable streaming notifications",
      usage: "y/streamLinksOff",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return args.length == 0;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("streamlink", false, message, "");
      }
  },

  setWelcomer: {
      description: "Enable welcome notifications",
      usage: "y/setWelcomer <text channel name>",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args, msg) => {
        return msg.guild.channels.find(x => x.name === args[0]) ? true : false;;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("welcomer", true, message, guild.channels.find(x => x.name === args[0]).id);
      }
  },

  welcomerOff: {
      description: "Disable welcome notifications",
      usage: "y/welcomerOff",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return args.length == 0;
      },
      function: (message, args, guild, id) => {
        toggleOption.toggleOption("welcomer", false, message, "");
      }
  },

  help:  {
      description: "Displays available commands",
      usage: "y/help",
      authorization: (id, guild, lvl='anyone') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function:(message, args, guild, id) => {
        let commandList = '\n';

        for(let command of Object.keys(module.exports)){
          if(module.exports[command].authorization(id, guild)) commandList += `**${module.exports[command].usage}**: ${module.exports[command].description}\n`;
        }

        let embed = new Discord.RichEmbed()
            .setColor(Yuko.settings.msgColor)
            .setAuthor('Commands', Yuko.bot.user.avatarURL)
            .setDescription(commandList);

        message.reply({embed});
    }
},

  checkbday: {
      description: "Check next birthday",
      usage: "y/checkbday",
      authorization: (id, guild, lvl='anyone') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async(message, args, guild, id) => {
        if(!args[0]) args[0] = message.author.id;
        if(!Yuko.bot.guilds.get(guild.id).members.get(args[0])) return message.reply('No such user exists in this server~');

        try{
          let data = await dataProvider.custom(`SELECT bdaydate FROM bday WHERE id = '${args[0]}' AND guild = '${guild.id}'`);

          if(data.rows[0]){
            message.reply(`${Yuko.bot.guilds.get(guild.id).members.get(args[0]).user.username}'s birthday is ${data.rows[0].bdaydate.getMonth() + 1}/${data.rows[0].bdaydate.getDate()}`);
          }else{
            message.reply(`${Yuko.bot.guilds.get(guild.id).members.get(args[0]).user.username}'s birthday is not recorded`);
          }
        }catch(err){console.log(err)}

      }
  },

  testbday: {
      description: "Test birthday notifications",
      usage: "y/testbday",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async(message, args, guild, id) => {

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
              fs.readdir('./pics/birthday', (err, files)=> {
                if(err){
                  console.log(err);
                  return test.error(err);
                }
                let index = Math.round(Math.random() * files.length);    
                Yuko.bot.guilds.get(row.guild).channels.get(info[row.guild].bdaychannel).send(`:confetti_ball: :confetti_ball:@here LETS ALL WISH ${Yuko.bot.guilds.get(row.guild).members.get(row.id).toString()} A HAPPY BIRTHDAY!!!!:confetti_ball: :confetti_ball: `, {
                                         files: [`./pics/birthday/${files[index]}`]
                                       });

              })
            }
          }
        }catch(e){
          test.errorLog(e);
        }
      }
  },

  testImage: {
      description: "Test image maker",
      usage: "y/testImage",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {
        imaging.createWelcomeImage(message.author, message.guild, message.channel);
      }
  },

  allServers: {
      description: "Display servers in Yuko's care",
      usage: "y/allServers",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {
        let serverIds = await dataProvider.custom(`SELECT id FROM servers`);

        let servers = '\n'
        for(let index of Object.keys(serverIds.rows)){
          servers += `${Yuko.bot.guilds.get(serverIds.rows[index].id).name}\n`;
        }
        message.reply(servers);
      }
  },

  checkStreams: {
      description: "Display current streams",
      usage: "y/checkStreams",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {

        let streams = await dataProvider.custom(`SELECT id, guild FROM stream_t WHERE status = true`);
        let guilds = await dataProvider.custom(`SELECT id FROM servers`);

        let result = {};

        for(let g of guilds.rows){
            result[Yuko.bot.guilds.get(g.id).name] = [];
        }

        for(let user of streams.rows){
          guildTmp = Yuko.bot.guilds.get(user.guild);
          memberTmp = guildTmp.members.get(user.id);

          result[guildTmp.name].push(memberTmp.user.username)
        }

        let str = ``;

        for(let i in result){
          str += `${i}: ${JSON.stringify(result[i])}\n`
        }

        test.log(str);

      }
  },

  testDatabase: {
      description: "Test database connection",
      usage: "y/testDatabase",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {
        await dataProvider.test();
      }
  },


  settings: {
      description: "Display settings for server",
      usage: "y/settings",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {
        let ns = "not Set";

        let result = await dataProvider.retrieve("servers", "id", guild.id);
        let settingList = `\n**Stream Notification**: ${result.rows[0].streamlinkbool}, ${result.rows[0].streamlinkbool ? guild.channels.get(result.rows[0].streamlinkchannel).name : ns}
                           **Stream Role Manipulation**: ${result.rows[0].streamrolebool}
                           **Welcomer**: ${result.rows[0].welcomerbool}, ${result.rows[0].welcomerbool ? guild.channels.get(result.rows[0].welcomerchannel).name : ns}
                           **Birthdays**: ${result.rows[0].bdaybool}, ${result.rows[0].bdaybool ? guild.channels.get(result.rows[0].bdaychannel).name : ns}`;
        let embed = new Discord.RichEmbed()
            .setColor(Yuko.settings.msgColor)
            .setAuthor('Settings', Yuko.bot.user.avatarURL)
            .setDescription(settingList);

        message.reply({embed});




      }
  },


  test: {
      description: "Tests Yuko's functions",
      usage: "y/test <arguments>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {

        fs.readdir('./pics/deusvult', (err, files)=> {
          if(err){
            console.log(err);
            return test.error(err);
          }
          test.log(files);
          test.log(files.length);
          let index = Math.round(Math.random() * files.length);

          message.channel.send(`WE WILL TAKE BACK THE HOLY LAND!!!!!`, {
                               files: [`./pics/deusvult/${files[index]}`]
                              })

        })



      }
  },

  deusvult: {
      description: "PRAISE THE SUN",
      usage: "y/deusvult",
      authorization: (id, guild, lvl='anyone') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {
        fs.readdir('./pics/deusvult', (err, files)=> {
          if(err){
            console.log(err);
            return test.error(err);
          }

          let index = Math.round(Math.random() * files.length);
          message.channel.send(`WE WILL TAKE BACK THE HOLY LAND!!!!!`, {
                               files: [`./pics/deusvult/${files[index]}`]
                              })

        })
      }
  },

  philkini: {
      description: "Display the glory that is Skoj Skull",
      usage: "y/philkini",
      authorization: (id, guild, lvl='anyone') => {
        return authorization.authorize(id, guild, lvl) && guild.id != 551261374865735690;
      },
      requirement: (args, message) => {
        return true;
      },
      function: (message, args, guild, id) => {
        message.channel.send(`He looks better in that than I do!`, {
                             files: ["./pics/philkini.jpg"]
                             })
      }
  },

  msg: {
      description: "Test Yuko sending message",
      usage: "y/msg",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {
        message.guild.owner.user.sendMessage("This is a test!");
      }
  },

  stream: {
      description: "Find those who are streaming",
      usage: "y/stream <person>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {
        Yuko.bot.guilds.get(args[0]).members.get(args[1]).addRole(Yuko.bot.guilds.get(args[0]).roles.find(x => x.name === "Streaming"));
      }
  },

  streamwrong: {
      description: "Correct those who are streaming",
      usage: "y/streamWrong <person>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {
        Yuko.bot.guilds.get(args[0]).members.get(args[1]).removeRole(Yuko.bot.guilds.get(args[0]).roles.find(x => x.name === "Streaming"));
      }
  },

  addRole: {
      description: "Add a role to server",
      usage: "y/addRole <role name>:<regular expression>",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args, msg) => {
        args = jsonMan.stringConverter(args).split(':');
        return Yuko.bot.guilds.get(msg.guild.id).roles.find(x => x.name === args[0]) ? true : false;
      },
      function: async(message, args, guild, id) => {
        args = jsonMan.stringConverter(args).split(':');
        let role = Yuko.bot.guilds.get(message.guild.id).roles.find(x => x.name === args[0]);

        let r = await dataProvider.custom(`SELECT * FROM role_t WHERE id = '${guild.id}' AND roleid = '${role.id}'`);

        if(r.rowCount != 0){
          let s = await dataProvider.custom({name: 'update-role', text: `UPDATE role_T SET regex = $1 WHERE id = $2 AND roleid = $3`, values: [`${args[1]}`, `${guild.id}`, `${role.id}`] });
          message.reply(`${role.name} updated`);
        }else{
          let c = await dataProvider.custom({name: 'create-role', text: `INSERT INTO role_T VALUES ($1, $2, $3)`, values: [`${guild.id}`, `${args[1]}`, `${role.id}`] });
          message.reply(`${role.name} rule added`);
        }

      }
  },

  removeRole: {
      description: "Remove a role from server",
      usage: "y/removeRole <role name>",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args, msg) => {
        args = jsonMan.stringConverter(args);
        return Yuko.bot.guilds.get(msg.guild.id).roles.find(x => x.name === args) ? true : false;
      },
      function: async(message, args, guild, id) => {
        let role = Yuko.bot.guilds.get(message.guild.id).roles.find(x => x.name === jsonMan.stringConverter(args));

        let r =  await dataProvider.custom(`SELECT * FROM role_t WHERE id = '${guild.id}' AND roleid = '${role.id}'`);

        if(r.rowCount == 0){
          message.reply(`${role.name} has no rule associated with it`);
        }else{
          let c = await dataProvider.custom({name: 'delete-role', text: `DELETE FROM role_T WHERE id = $1 AND roleid = $2`, values: [`${guild.id}`, `${role.id}`] });
          message.reply(`Rule removed from ${role.name} role`);
        }
      }
  },

  showRoles: {
      description: "Show server roles",
      usage: "y/showRoles",
      authorization: (id, guild, lvl='moderator') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async(message, args, guild, id) => {
        let r = await dataProvider.custom({name: 'fetch-all-role', text: `SELECT * FROM role_t WHERE id = $1`, values: [`${guild.id}`] });

        if(r.rowCount == 0){
          message.reply('No role rules exist for this server');
        }else{
          let n = `\n`;

          let role;
          for(let rule of r.rows){
          role = Yuko.bot.guilds.get(message.guild.id).roles.get(rule.roleid);
          n += `${role.name}: ${rule.regex}\n`;
          }

          message.reply(n);
        }

      }
  },

  testWelcomer: {
      description: "Test welcome notifications",
      usage: "y/testWelcomer",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async(message, args, guild, id) => {
        //commandController.welcome(message.author, message.guild);
        let data = await dataProvider.custom(`SELECT welcomerbool, welcomerchannel FROM servers WHERE id = '${guild.id}'`);

        if(data.rows[0].welcomerbool){
            Yuko.bot.guilds.get(guild.id).owner.user.send(`${message.author.username} has joined ${guild.name}!`);

            return Yuko.bot.guilds.get(guild.id).channels.get(data.rows[0].welcomerchannel).send(`Welcome ${message.author.toString()} to this server.
                   Remember everything isn't as it seems and many here are prone to flights of fancy.`);
        }
      }
  },

  setGame: {
      description: "Sets Yuko's game status",
      usage: "y/setGame <title>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: (message, args, guild, id) => {

        let title = jsonMan.stringConverter(args);
        let gameObj = {game: {name: "", type: 0}};

        gameObj.game.name = title;

        return Yuko.bot.user.setPresence(gameObj);
      }
    },

    addServer: {
      description: "Adds new server",
      usage: "y/addServer <server id>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return true;
      },
      function: async (message, args, guild, id) => {
        try{
          await dataProvider.custom(`INSERT INTO servers (id, name) VALUES ('${Yuko.bot.guilds.get(args[0]).id}', '${Yuko.bot.guilds.get(args[0]).name}')`);
          test.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
          console.log(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
        }catch(err){
          console.log(err);
          test.errorLog("Error: " + err);
        }
      }
    },

    extract: {
      description: "Get user profile pic",
      usage: "y/extract <user id>",
      authorization: (id, guild, lvl='rune') => {
        return authorization.authorize(id, guild, lvl);
      },
      requirement: (args) => {
        return args.length == 1;
      },
      function: (message, args, guild, id) => {
        try{
          message.reply(message.guild.members.get(args[0]).user.displayAvatarURL);
        }catch(err){
          console.log(err);
          test.errorLog("Error: " + err);
        }
      }

    }
}
