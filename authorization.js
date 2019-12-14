const Yuko = require("./Yuko.js");

var levels = {
  yuko: (userId, guild) => {
    return userId == Yuko.settings.my_id;
  },
  rune: (userId, guild) => {
    return userId == Yuko.settings.rune;
  },
  owner: (userId, guild) => {
    return userId === guild.owner.id;
  },
  moderator: (userId, guild) => {
    return guild.members.get(userId).hasPermission('ADMINISTRATOR');
  },
  anyone: (userId, guild) => {
    return true;
  }
}

module.exports = {
  authorize: (userId, guild, reqLvl) => levels[reqLvl](userId, guild)
};
