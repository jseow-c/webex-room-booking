//  __   __  ___        ___
// |__) /  \  |  |__/ |  |
// |__) \__/  |  |  \ |  |

// This is the main file for the moh-bot bot.

// Import Botkit's core features
const { Botkit } = require("botkit");

// Import a platform-specific adapter for webex.
const ngrok = require("ngrok");

const { WebexAdapter } = require("botbuilder-adapter-webex");

// webhook_uri
const webhook_uri = "/api/messages";

exports.startBot = async () => {
  const url = await ngrok.connect({
    authtoken: process.env.NGROK_TOKEN,
    addr: process.env.PORT,
    region: "ap",
  });

  let storage = null;

  const adapter = new WebexAdapter({
    // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    enable_incomplete: true,
    access_token: process.env.WEBEX_KEY,
    public_address: url,
  });
  // enable webhook
  adapter.registerWebhookSubscription(webhook_uri);
  // enables card in webhook (current way to deal with cards)
  adapter.registerAdaptiveCardWebhookSubscription(webhook_uri);

  const controller = new Botkit({ webhook_uri, adapter, storage });

  // Once the bot has booted up its internal services, you can use them to do stuff.
  controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + "/features");

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
      controller.on("message,direct_message", async (bot, message) => {
        let results = false;
        results = await controller.plugins.cms.testTrigger(bot, message);

        if (results !== false) {
          // do not continue middleware!
          return false;
        }
      });
    }
  });

  controller.webserver.get("/", (req, res) => {
    res.send(`This app is running Botkit ${controller.version}.`);
  });
};
