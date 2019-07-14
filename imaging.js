const jimp = require("jimp");
const fs = require('fs');

module.exports = {
  createWelcomeImage: function(user, guild, channel) {

      jimp.read('./pics/welcomerBackground.png').then(function(background){
        jimp.read(user.avatarURL).then(function(profPic){
          jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function (font) {
            profPic.resize(125, jimp.AUTO)

            background.clone()
              .composite(profPic, 0, 0)
              .print(font, 130, 55, guild.name)
              .print(font, 5, 130, `Welcome ${user.username}`)
              .print(font, 5, 165, `You are user ${guild.memberCount}`)
              .write('./pics/welcomeTemp.png', function(err, image){
                channel.send({
                    files: ['./pics/welcomeTemp.png']
                });
              });
            });
          });
        });
  }

}
