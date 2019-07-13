const Yuko = require("../Yuko.js");
const Discord = require('discord.js');
const jsonMan = require("../jsonMan.js");
const test = require("../testingMethods.js");
const dataProvider = require('../dataProvider.js');
const presence = require('../presence.js');
const requests = require("../requests.js");
const util = require('util');

module.exports = {

        evaluateRole: async function(oldMember, newMember){

          let guild = newMember.guild;
          let streamRole = guild.roles.find(x => x.name === "Streaming");
          
          if(!guild.members.get(Yuko.settings.myId).hasPermission("MANAGE_ROLES")) return;
          if(guild.members.get(Yuko.settings.myId).highestRole.position < newMember.highestRole.position) return;


          if(newMember.user.bot) return;

          // Stream Controller
          try{
              let streamPres = await presence.streamPresence(newMember, oldMember);

              // Check if stream update
              if(streamPres[0]){
                let serverSettings = await dataProvider.retrieve("servers", "id", guild.id);
                serverSettings = serverSettings.rows[0];

                // Check if stream role changing is enabled
                if(serverSettings.streamrolebool){

                  // Create streaming role if missing
                  if(!streamRole){ guild.createRole({name: "Streaming"}); streamRole = guild.roles.find(x => x.name === "Streaming"); }

                  // Give or take role?
                  if(streamPres[1] === 'Start Stream') newMember.addRole(streamRole);//test.log(`${newMember.user.username} gets stream role in ${guild.name}`)
                  if(streamPres[1] === 'Stop Stream') newMember.removeRole(streamRole);//test.log(`${newMember.user.username} needs role removed in ${guild.name}`)
                }

                // Check if streaming notifications are enabled
                if(serverSettings.streamlinkbool){

                  // Starting or stopping a stream?
                  if(streamPres[1] === 'Start Stream'){
                    await presence.stream(newMember, serverSettings.streamlinkchannel);
                  }else if(streamPres[1] === 'Stop Stream'){
                    //await presence.removeStream(newMember);
                  }
                }
              }
          }catch(e){
            test.errorLog(`Stream role exception!
                           Error:
                           ${e}`);
            console.log(e);
            test.errorLog(`Old Member:
                           ${util.inspect(oldMember)}`);

            test.errorLog(`New Member:
                           ${util.inspect(newMember)}`);
          }


          // Game role controller
          try{
            let serverRoles = await dataProvider.custom(`SELECT * FROM role_t WHERE id = '${newMember.guild.id}'`)

            if(serverRoles.rowCount){
               if(newMember.presence.game){

                 if(!oldMember.presence.game || oldMember.presence.game.name != newMember.presence.game.name){
                   for(let rule of serverRoles.rows){
                     rule.regex = new RegExp(rule.regex);
                     if(rule.regex.test(newMember.presence.game)){
                       let role = Yuko.bot.guilds.get(newMember.guild.id).roles.get(rule.roleid);
                       newMember.addRole(role);
                     }else if(newMember.roles.get(rule.roleid)){
                         newMember.removeRole(newMember.roles.get(rule.roleid));
                     }
                   }
                 }

               }else if(oldMember.presence.game){
                 for(let rule of serverRoles.rows){
                   if(newMember.roles.get(rule.roleid)){
                    newMember.removeRole(newMember.roles.get(rule.roleid));
                   }
                 }
               }
             }

           }catch(e){
             test.errorLog(`Game role exception!
                            Error:
                            ${e}`);
             console.log(e);
             test.errorLog(newMember.presence.game ? test.errorLog(JSON.stringify(newMember.presence.game)) : 'newMember does not have a game');

             test.errorLog(`Old Member:
                            ${util.inspect(oldMember)}`);

             test.errorLog(`New Member:
                            ${util.inspect(newMember)}`);

            test.errorLog(typeof oldMember.presence.game);
            test.errorLog(typeof newMember.presence.game);
            }

        return;

      }
}
