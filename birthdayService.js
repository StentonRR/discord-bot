const schedule = require('node-schedule');
const commandController = require("./commandController.js");

module.exports = {
  bdayService: () => commandController.checkbdayservice();
}
