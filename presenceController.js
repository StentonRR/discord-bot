const Discord = require('discord.js');
const jsonMan = require("./jsonMan.js");
const test = require("./testingMethods.js");
const auth = require("./auth.json");
const dataProvider = require('./dataProvider.js');
const presence = require('./presence.js');
const playersId = auth.players;
const requests = require("./requests.js");
const util = require('util');

module.exports = {

        evaluateRole: async function(oldMember, newMember){

          let guild = newMember.guild;
          let streamRole = guild.roles.find(x => x.name === "Streaming");

          if(!guild.members.get('341746349424771072').hasPermission("MANAGE_ROLES")) return;
          if(newMember.user.bot) return;

          // Stream Controller
          try{
              let streamPres = await presence.streamPresence(newMember, oldMember);

              // Check if stream update
              if(streamPres[0]){
                let serverSettings = await dataProvider.retrieve("servers", "id", guild.id);

                // Check if stream role changing is enabled
                if(serverSettings.rows[0].streamrolebool){

                  // Create streaming role if missing
                  if(!streamRole){ guild.createRole({name: "Streaming"}); streamRole = guild.roles.find(x => x.name === "Streaming"); }

                  // Give or take role?
                  if(streamPres[1] === 'Start Stream'){test.log(`${newMember.user.username} gets stream role in ${guild.name}`)}
                  if(streamPres[1] === 'Stop Stream'){test.log(`${newMember.user.username} needs role removed in ${guild.name}`)}
                }

                // Check if streaming notifications are enabled
                if(serverSettings.rows[0].streamlinkbool){

                  // Starting or stopping a stream?
                  if(streamPres[1] === 'Start Stream'){
                    await presence.stream(newMember, serverSettings.rows[0].streamlinkchannel);
                  }else if(streamPres[1] === 'Stop Stream'){
                    await presence.removeStream(newMember);
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

          // // Start Stream
          // if((newMember.presence.game && newMember.presence.game.streaming) && (!oldMember.game || !oldMember.game.streaming)){
          //     let serverSettings = await dataProvider.retrieve("servers", "id", guild.id);
          //
          //     // Check if streaming notifications are enabled
          //     if(serverSettings.rows[0].streamlinkbool){
          //         if(!streamRole){ guild.createRole({name: "Streaming"}); streamRole = guild.roles.find(x => x.name === "Streaming"); }
          //
          //         let status = await presence.streamStatus(newMember);
          //
          //         // Check if person is not already streaming
          //         if(!status){
          //           presence.stream(newMember, serverSettings.rows[0].streamlinkchannel, streamRole);
          //           test.log(`${newMember.user.username} started streaming in ${newMember.guild.name}`);
          //
          //           // Check if it is twitch stream link
          //           if(requests.twitch.isTwitch(newMember.presence.game.url)){
          //             let streamInfo = await requests.twitch.getStream(newMember.presence.game.url);
          //             console.log(JSON.stringify(streamInfo));
          //             let gameInfo = await requests.twitch.getGame(streamInfo.data[0].game_id);
          //             test.log(`@here ${newMember.user.username} is streaming ${gameInfo.data[0].name}\n${newMember.presence.game.url}`);
          //
          //             let streamEmbed = new Discord.RichEmbed()
          //                 .setColor('#981111')
          //                 .setAuthor(newMember.user.username, newMember.user.avatarURL)
          //                 .setTitle(streamInfo.data[1].title)
          //                 .setImage(streamInfo.data[1].thumbnail_url);
          //
          //             test.embed({streamEmbed});
          //
          //           }else{
          //             test.log('Non-twitch stream detected');
          //           }
          //         }
          //       }
          //
          //   // End Stream
          //   }else if((oldMember.presence.game && oldMember.presence.game.streaming) && (!newMember.presence.game || !newMember.presence.game.streaming)){
          //      let serverSettings = await dataProvider.retrieve("servers", "id", guild.id);
          //
          //      // Check if streaming notifications are enabled
          //      if(serverSettings.rows[0].streamlinkbool){
          //        if(!streamRole){ guild.createRole({name: "Streaming"}); streamRole = guild.roles.find(x => x.name === "Streaming"); }
          //        let status = await presence.streamStatus(newMember);
          //
          //        // Check if person is not already done streaming
          //        if(status){
          //
          //          // Check if it is twitch stream link
          //          if(requests.twitch.isTwitch(newMember.presence.game.url)){
          //            let streamInfo = await requests.twitch.getStream(oldMember.presence.game.url);
          //
          //            // Ensure twitch stream is off
          //            if(!streamInfo.data){
          //              presence.removeStream(newMember, serverSettings.rows[0].streamlinkchannel, streamRole);
          //              test.log(`${newMember.user.username} stopped twitch streaming in ${newMember.guild.name}`);
          //            }
          //          }else{
          //            test.log(`${newMember.user.username} stopped streaming in ${newMember.guild.name}`);
          //          }
          //        }
          //      }
          //    }
          //







          try{
             // Game role logic
             if(newMember.presence.game){
               let serverRoles = await dataProvider.custom({name: 'fetch-role', text: `SELECT role FROM role_t WHERE id = $1 AND role LIKE $2`, values: [`${newMember.guild.id}`, `%${newMember.presence.game.name}%`] });

                 if(serverRoles.rowCount != 0 && (!oldMember.presence.game || oldMember.presence.game.name != newMember.presence.game.name)){
                   let gameRole = guild.roles.find(x => x.name == `Playing ${serverRoles.rows[0].role}`);

                   if(!gameRole){ guild.createRole({name: `Playing ${serverRoles.rows[0].role}`}); gameRole = guild.roles.find(x => x.name == `Playing ${serverRoles.rows[0].role}`); };

                   newMember.addRole(gameRole);

                 }else if(!oldMember.presence.game || oldMember.presence.game.name != newMember.presence.game.name){
                   let gameRole = newMember.roles.find(x => x.name.includes('Playing'));
                   if(gameRole) newMember.removeRole(gameRole);
                 }


             }else if(oldMember.presence.game){
               let gameRole = newMember.roles.find(x => x.name.includes('Playing'));
               if(gameRole) newMember.removeRole(gameRole);
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




           if(!auth.testing){
            var servers =  jsonMan.read("./servers.json");

            const PLAYERS = auth.bot.guilds.get('323278503602814981');

            if(newMember.user.bot) return;

            if(streamRole){
                  if((newMember.presence.game == null || !newMember.presence.game.streaming) && newMember.roles.has(streamRole.id)){
                         newMember.removeRole(streamRole);
        								 //this.removeStream(newMember.user);
                  }

                  if(newMember.presence.game != null){
                        if(newMember.presence.game.type == 1){
                                //test.log(`-----------\noldMember: ${JSON.stringify(oldMember)}\nnewMember: ${JSON.stringify(newMember)}`);
                                newMember.addRole(streamRole);
                                if((oldMember.presence.game == null || oldMember.presence.game.type != 1) && servers[guild.id]["streamlink"][0]){
                                    //guild.channels.find("name", servers[guild.id]["streamlink"][1]).send(`@here WE GOT A STREAMER: ${newMember.presence.game.url}`);
                                    this.checkStream(newMember);
                                }
                        }
                    }
            }
          }

        return;
      	// if(guild.id == playersId){
        //
      	// 	if(newMember.presence.game){
      	// 		let check = this.checkRole(newMember.presence.game.name, true);
        //
      	// 		if(check[0]){
      	// 			let roleName = "Playing " + check[1];
      	// 			if(guild.roles.find(x => x.name === roleName)){
      	// 				newMember.addRole(guild.roles.find(x => x.name === roleName));
      	// 			}else{
        //         guild.createRole({
        //             name: roleName
        //         });
        //       let newRole = guild.roles.find(x => x.name === roleName);
        //       try{
        //         newMember.addRole(newRole).catch(console.error);
        //       }catch(err){test.errorLog(err);}
        //       }
      	// 		}
      	// 		for(var currRole of newMember._roles){
      	// 			if(guild.roles.get(currRole).name.includes("Playing") && currRole.substring(8) != check[1]){
      	// 				newMember.removeRole(currRole);
      	// 			}
      	// 		}
        //
      	// 	}else{
      	// 		for(let currRole of newMember._roles){
      	// 			if(guild.roles.get(currRole).name.includes("Playing")){
      	// 				newMember.removeRole(currRole);
      	// 			}
      	// 		}
      	// 	}
        //
      	// }else{
        //
      	// 	if(newMember.presence.game){
      	// 		try{
      	// 			let check = this.checkRole(newMember.presence.game.name, false);
        //
      	// 			if(check[0]){
      	// 				let roleName = "Playing " + check[1];
        //           if(guild.roles.find(x => x.name === roleName)){
      	// 				     newMember.addRole(guild.roles.find(x => x.name === roleName));
        //           }
      	// 			}
      	// 			for(let currRole of newMember._roles){
      	// 				if(guild.roles.get(currRole).name.includes("Playing") && currRole.substring(8) != check[1]){
      	// 					newMember.removeRole(currRole);
      	// 				}
      	// 			}
      	// 		}catch(err){
      	// 				console.log(err);
      	// 		}
      	// 	}else{
      	// 		for(let currRole of newMember._roles){
      	// 			if(guild.roles.get(currRole).name.includes("Playing")){
      	// 				newMember.removeRole(currRole);
      	// 			}
      	// 		}
      	// 	}
      	// }
        //
        // return;
      },

      	checkRole: function(game, playersBool){
          var ROLES = jsonMan.read("./database/roles.json");

      		let check = [false, ""];
      		if(playersBool){
      			for(let role of ROLES["players"]){
      				if(game.includes(role)){
      				   check[0] = true;
      				   check[1] = role;
      				}
      			}
      		}else{
      			for(let role of ROLES["other"]){
      			  if(game.includes(role)){
      			     check[0] = true;
      			     check[1] = role;
      			  }
      		}
      	}
      		return check;
      	},

      	addGameRole: function(gameTitle, message){
          var ROLES = jsonMan.read("./database/roles.json");

          let guild = message.guild;

      		if(guild.id == playersId && !ROLES["players"].includes(gameTitle)) {
            let rolesObj = jsonMan.read("./database/roles.json");
      			rolesObj["players"].push(gameTitle);
            jsonMan.write("./database/roles.json", rolesObj);
            message.reply("Added game role");
      		}else if(guild.id != playersId && !ROLES["other"].includes(gameTitle)){
            let rolesObj = jsonMan.read("./database/roles.json");
            rolesObj["other"].push(gameTitle);
            jsonMan.write("./database/roles.json", rolesObj);
            message.reply("Added game role");
      		}else{
      			message.reply("Unable to add game role");
      		}
          delete require.cache[require.resolve('./database/roles.json')];
          ROLES = require("./database/roles.json");
      	},

      	removeGameRole: function(gameTitle, message){
          var ROLES = jsonMan.read("./database/roles.json");

          let guild = message.guild;

      		if(guild.id == playersId && ROLES["players"].includes(gameTitle)) {
            let rolesObj = jsonMan.read("./database/roles.json");
      			rolesObj["players"].splice(rolesObj["players"].indexOf(gameTitle), 1);
            jsonMan.write("./database/roles.json", rolesObj);
            message.reply("Removed game role");
      		}else if(guild.id != playersId && ROLES["other"].includes(gameTitle)){
            let rolesObj = jsonMan.read("./database/roles.json");
      			rolesObj["other"].splice(rolesObj["other"].indexOf(gameTitle), 1);
            jsonMan.write("./database/roles.json", rolesObj);
            message.reply("Removed game role");
      		}else{
      			message.reply("Unable to remove game role");
      		}
          delete require.cache[require.resolve('./database/roles.json')];
          ROLES = require("./database/roles.json");
      	},

        showGameRoles: function(message){
          var ROLES = jsonMan.read("./database/roles.json");

          let guild = message.guild;

          if(guild.id == playersId) {
            for(let role of ROLES["players"]){
              message.reply(role);
            }
          }else if(guild.id != playersId){
            for(let role of ROLES["other"]){
              message.reply(role);
            }
          }else{
            message.reply("Unable to retrieve roles!");
          }
        },

        //Checks if stream notification is true and notifies of stream if so
        checkStream: function(person){


        		let obj = jsonMan.read("servers.json");
        		let streamers = jsonMan.read("streamers.json");

        		if(Object.keys(streamers).length === 0){
        			streamers[person.username] = person.id;
        			jsonMan.write("streamers.json", streamers);
        		}else{

        		for(var guy in streamers){
        			if(streamers[guy] === person.id) {
        				return;
        			}
        		}

        		streamers[person.username] = person.id;
        		jsonMan.write("streamers.json", streamers);
        	}


        		for(var server in obj){
        		  if(!obj[server]["streamlink"][0]){continue;}
        			if(auth.bot.guilds.get(server) === "undefined" || typeof auth.bot.guilds.get(server).members.get(person.id) === "undefined"){continue;}
        			if(this.checkGlitch(server, person) == false){continue;}

        		  	auth.bot.guilds.get(server).channels.find(x => x.name === obj[server]["streamlink"][1]).send(`@here WE GOT A STREAMER: ${person.presence.game.url}`);
        				//auth.bot.guilds.get("341746752409567242").channels.find("name", "general").send(`@everyone WE GOT A STREAMER: ${person.presence.game.url}`);
        		 		break;
        		}
        },

        removeStream: function(person){

        	let streamers = jsonMan.read("streamers.json");
        	delete streamers[person.username];

        	return jsonMan.write("streamers.json", streamers);
        },

        checkGlitch: function(guild, person){

          let inter = auth.inter;

          let obj = jsonMan.read("servers.json");
        	if(obj[guild]["streamlink"][1] === "") return false;

            let date = new Date();
        		//console.log("guild: " + auth.bot.guilds.get(guild));
        		//console.log("channel: " + auth.bot.guilds.get(guild).channels.find("name", obj[guild]["streamlink"][1]));
            let messages = auth.bot.guilds.get(guild).channels.find(x => x.name === obj[guild]["streamlink"][1]).fetchMessages({limit: 25})
          .then(messages => {

          										let msg = messages.find(x => x.content == `@here WE GOT A STREAMER: ${person.presence.game.url}`);

        											if(msg == undefined || null) return true;

                              if(msg.createdAt.getDate() === date.getDate() && ((date.getHours() - msg.createdAt.getHours()) < inter)) { return false};

                              return true;
        }).catch(console.error);
      },

      getRoleLists: function(){
        var ROLES = jsonMan.read("./database/roles.json");
        return `\nPlayers: ${ROLES["players"]}\nOther: ${ROLES["other"]}`;
      }
}
