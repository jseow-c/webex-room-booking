// Load process.env values from .env file
require("dotenv").config();

// Get Token from Graph API and setInterval to do so
const CronJob = require("cron").CronJob;
const { save_token } = require("./functions/save_token");
const cronInterval = "0 */30 * * * *";
new CronJob(cronInterval, save_token, null, true, "Asia/Singapore");
save_token();

// start bot
const bot = require("./ngrok-bot");
bot.startBot();
