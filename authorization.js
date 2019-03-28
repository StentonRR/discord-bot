const auth = require("./auth.json");

var levels = {
  yuko: (userId, guild) => {
    return userId == auth.myId;
  },
  rune: (userId, guild) => {
    return userId == auth.rune;
  },
  owner: (userId, guild) => {
    return userId === guild.owner.id;
  },
  anyone: (userId, guild) => {
    return true;
  }
}

module.exports = {

  authorize: (userId, guild, reqLvl) => {
    return levels[reqLvl](userId, guild);
  }

};
