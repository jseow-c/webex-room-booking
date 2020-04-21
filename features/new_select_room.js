/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// const { formatRoomsForWebex } = require("../functions/format_functions");
// const { WX_GET_PERSON_DETAILS } = require("../functions/webex_functions");
const { convertTime } = require("../functions/time_functions");
const { EWS_FIND_ROOMS } = require("../functions/ews_functions");
const {
  bookCard,
  alternativeMainCard,
  alternativeRoomCard,
} = require("../templates/room_card");
// const { dialogFlowClass } = require("../functions/dialogflow_functions");
const roomData = require("../resources/data");
const { whiteList } = require("../resources/whitelist");

const AWS = require("aws-sdk");
const proxy = require("proxy-agent");

// adds proxy to aws config if required
// proxy stated in environment as PROXY
if (process.env.PROXY) {
  AWS.config.update({
    httpOptions: { agent: proxy(process.env.PROXY) },
  });
}

// initialize aws components
const lexRuntime = new AWS.LexRuntime();

/**
 * Select new room
 */
module.exports = function (controller) {
  controller.on(["message", "direct_message"], async (bot, message) => {
    // whitelist only authorized users
    // let userDetail = await WX_GET_PERSON_DETAILS(message.user);
    // if (!whiteList.includes(userDetail.emails[0])) return;
    if (!whiteList.includes(message.user)) return;

    // find intent through Amazon Lex
    const lexParams = {
      botAlias: process.env.AWS_BOT_ALIAS,
      botName: process.env.AWS_BOT_NAME,
      inputText: message.text,
      userId: message.user,
      requestAttributes: {
        "x-amz-lex:time-zone": "Singapore",
      },
    };
    const response = await lexRuntime.postText(lexParams).promise();

    if (
      response.dialogState === "ElicitIntent" ||
      response.dialogState === "ElicitSlot"
    ) {
      return bot.reply(message, response.message);
    } else {
      // remove user's session from Amazon Lex
      const deleteParams = {
        botAlias: process.env.AWS_BOT_ALIAS,
        botName: process.env.AWS_BOT_NAME,
        userId: message.user,
      };
      await lexRuntime.deleteSession(deleteParams).promise();

      // reply user with options
      const slots = response.slots;
      const dateTime = `${slots.Date}T${slots.Time}:00+08:00`;
      const roomsForSelectedBuilding = roomData[`EWS_ListOfRooms_SNG15`];
      const durRegex = slots.Duration.match(/PT((\d+)[H])?((\d+)[M])?/);
      console.log(slots);
      const parsedDuration =
        parseInt(durRegex[2] ? durRegex[2] * 60 : 0, 10) +
        parseInt(durRegex[4] ? durRegex[4] : 0, 10);
      let startTime = await convertTime(dateTime);
      let endTime = await convertTime(dateTime, parsedDuration);

      const roomsFound = await EWS_FIND_ROOMS(
        roomsForSelectedBuilding,
        parseInt(slots.Pax, 10),
        startTime,
        endTime
      );
      if (roomsFound.match) {
        return bot.reply(message, {
          text: "Match the room found.",
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: bookCard(roomsFound.match, startTime, parsedDuration),
            },
          ],
        });
      } else {
        const altRoomCards = [];
        let numOfRoom = 1;
        if (roomsFound.timeMatch.room) {
          altRoomCards.push(
            alternativeRoomCard(
              roomsFound.timeMatch.room,
              roomsFound.timeMatch.startTime,
              parsedDuration,
              `Option${numOfRoom} (Different Time)`,
              "emphasis"
            )
          );
          numOfRoom += 1;
        }
        if (roomsFound.sizeMatch) {
          altRoomCards.push(
            alternativeRoomCard(
              roomsFound.sizeMatch,
              startTime,
              parsedDuration,
              `Option${numOfRoom} (${
                roomsFound.sizeMatch.size === "L" ? "Large" : "Small"
              } Room)`,
              "accent"
            )
          );
        }
        return bot.reply(message, {
          text: "Match the room found.",
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: alternativeMainCard(altRoomCards),
            },
          ],
        });
      }
    }
  });
};
