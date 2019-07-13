const Discord = require('discord.js');
const dataProvider = require('./dataProvider.js');
const test = require("./testingMethods.js");
const jsonMan = require("./jsonMan.js");
const requests = require("./requests.js");
const util = require('util');

module.exports = {

  stream: async (member, streamChannel) => {

    // Check if it is twitch stream link
    if(requests.twitch.isTwitch(member.presence.game.url)){

      setTimeout( async() => {
        let streamInfo = await requests.twitch.getStream(member.presence.game.url);
        let userInfo = await requests.twitch.getUser(member.presence.game.url);

        if(streamInfo.data.length == 0){
          let streamEmbed = new Discord.RichEmbed()
              .setColor('#981111')
              .setAuthor(member.user.username, member.user.avatarURL)
              .addField(`Check out ${member.user.username}'s stream!`, member.presence.game.url)
              .setImage(member.user.avatarURL);

          member.guild.channels.get(streamChannel).send(streamEmbed);
        }else{

          let gameInfo = await requests.twitch.getGame(streamInfo.data[0].game_id);

          let streamEmbed = new Discord.RichEmbed()
              .setColor('#981111')
              .setAuthor(member.user.username, member.user.avatarURL)
              .addField(streamInfo.data[0].title, member.presence.game.url)
              .setImage(userInfo.data[0].profile_image_url)
              .setThumbnail(gameInfo.data[0].box_art_url.replace("{width}x{height}", "1000x1300"));

          member.guild.channels.get(streamChannel).send(streamEmbed);
        }
      }, 60000);
    }else{
      test.log('Non-twitch stream detected');
    }
  },


  removeStream: async (member) => {
    //test.log(`${member.user.username} stopped streaming in ${member.guild.name}`);
  },


  streamStatus: async (member) => {
    let status;

    let streamInfo = await dataProvider.custom(`SELECT * FROM stream_t WHERE id = '${member.id}' AND guild = '${member.guild.id}'`);

      if(streamInfo.rowCount != 0){
        status = streamInfo.rows[0].status;
      }else{
        status = false;
      }

    return status;
  },


  streamPresence: async function(newMember, oldMember){
    let result =  [false, ''];
    let status = await module.exports.streamStatus(newMember);

    if ((newMember.presence.game && newMember.presence.game.streaming) && (!oldMember.presence.game || !oldMember.presence.game.streaming) && !status){
      result[0] = true;
      result[1] = 'Start Stream';

      // Log stream in db
      let data = await dataProvider.custom(`UPDATE stream_t SET status = ${true} WHERE id = '${newMember.id}' AND guild = '${newMember.guild.id}'`);
      if(data.rowCount == 0){
        dataProvider.custom(`INSERT INTO stream_t VALUES ('${newMember.id}', '${newMember.guild.id}', ${true})`);
      }

    }else if((oldMember.presence.game && oldMember.presence.game.streaming) && (!newMember.presence.game || !newMember.presence.game.streaming) && status){
        result[0] = true;
        result[1] = 'Stop Stream';

        //log stream end in db
        let data = await dataProvider.custom(`UPDATE stream_t SET status = ${false} WHERE id = '${newMember.id}' AND guild = '${newMember.guild.id}'`);
        if(data.rowCount == 0){
          dataProvider.custom(`INSERT INTO stream_t VALUES ('${newMember.id}', '${newMember.guild.id}', ${false})`);
        }
    }

    return result;
  },


  streamPresenceTest: async function(newMember, oldMember){
    let result =  [false, ''];
    let status = true;

    if((newMember.presence.game && newMember.presence.game.streaming) && (!oldMember.presence.game || !oldMember.presence.game.streaming) && !status){
      result[0] = true;
      result[1] = 'Start Stream';

    }else if((oldMember.presence.game && oldMember.presence.game.streaming) && (!newMember.presence.game || !newMember.presence.game.streaming) && status){
        result[0] = true;
        result[1] = 'Stop Stream';
    }
    return result;
    },


  gamePresence: function(member, oldMember){

  }

}
