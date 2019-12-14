const test = require("./testingMethods.js");
const Yuko = require("./Yuko.js");
const fetch = require("node-fetch");


module.exports = {

  twitch: {

    getStream: async (url) => {
      let urlPieces = url.split('/');
      let username = urlPieces[urlPieces.length - 1];

      let response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`
                                  , {method: 'GET', headers: {"Client-ID": Yuko.settings.twitch_id}} );

      let streamInfo = await response.json();

      return streamInfo;
    },


    isTwitch: (url) => {
      return url.indexOf('www.twitch.tv/') > -1 ? true: false;
    },


    getGame: async (gameId) => {
      let response = await fetch(`https://api.twitch.tv/helix/games?id=${gameId}`
                                , {method: 'GET', headers: {"Client-ID": Yuko.settings.twitch_id}} );

      let gameInfo = await response.json();

      return gameInfo;

    },

    getUser: async (url) => {
      let urlPieces = url.split('/');
      let username = urlPieces[urlPieces.length - 1];

      let response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`
                                  , {method: 'GET', headers: {"Client-ID": Yuko.settings.twitch_id}} );

      let userInfo = await response.json();

      return userInfo;
    }
  }


}
