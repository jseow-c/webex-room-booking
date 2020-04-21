/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { convertTime } = require("../functions/time_functions");
const { EWS_CREATE_MEETING_INVITE } = require("../functions/ews_functions");
const { CREATE_CONFIRM_CARD } = require("../functions/webex_card_functions");
const { WX_GET_PERSON_DETAILS } = require("../functions/webex_functions");

/**
 * Book New Room - on Click on Cards (attachmentActions)
 */
module.exports = function (controller) {
  // test attachmentActions
  controller.on("attachmentActions", async (bot, message) => {
    const params = message.incoming_message.value;
    console.log(message);
    if (params.type === "book") {
      const meetingStartDateTime = await convertTime(params.time);
      const meetingEndDateTime = await convertTime(
        params.time,
        parseInt(params.duration, 10)
      );
      const userDetail = await WX_GET_PERSON_DETAILS(message.user);

      const bookingStatus = await EWS_CREATE_MEETING_INVITE(
        meetingStartDateTime.format(),
        meetingEndDateTime.format(),
        "[CONFIRMED]: \n" + userDetail.displayName + "'s Meeting",
        params.alias,
        params.name,
        userDetail.emails[0]
      );

      if (bookingStatus !== null) {
        const wxMsg_Text_BookingResponse_Final =
          "Success! Booking completed for *" +
          meetingStartDateTime.format("dddd, MMMM Do") +
          "* from " +
          meetingStartDateTime.format("hh:mm a") +
          " to " +
          meetingEndDateTime.format("hh:mm a");

        const meetingDateTime_Formatted_for_card =
          meetingStartDateTime.format("dddd, MMMM Do") +
          " \n " +
          meetingStartDateTime.format("hh:mm a") +
          " - " +
          meetingEndDateTime.format("hh:mm a");

        const wxMsg_Card_BookingResponse_Final = await CREATE_CONFIRM_CARD(
          params.name,
          params.description,
          "[CONFIRMED]: " + userDetail.displayName + "'s Meeting",
          meetingDateTime_Formatted_for_card,
          userDetail.emails[0]
        );

        return bot.reply(message, {
          text: wxMsg_Text_BookingResponse_Final,
          markdown: wxMsg_Text_BookingResponse_Final,
          attachments: [wxMsg_Card_BookingResponse_Final],
        });
      } else {
        return bot.reply(message, "Booking failed.");
      }
    } else {
      return bot.reply(message, {
        text: "Do not understand your click intention.",
      });
    }
  });
};
