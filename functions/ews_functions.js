const ews = require("ews-javascript-api");
const axios = require("axios");
const { getToken } = require("../functions/misc_function");
const { convertTime } = require("../functions/time_functions");
let service = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013);
service.Credentials = new ews.WebCredentials(
  process.env.EWS_EMAIL,
  process.env.EWS_PASSWORD
);
service.Url = new ews.Uri("https://outlook.office365.com/Ews/Exchange.asmx");

module.exports = {
  // -------------------------------------------------------------------------
  EWS_CREATE_MEETING_INVITE: async function (
    meetingStartTime,
    meetingEndTime,
    meetingTitle,
    meetingRoomAlias,
    meetingRoomName,
    meetingInvitees
  ) {
    ews.EwsLogging.DebugLogEnabled = false;
    let appointment = new ews.Appointment(service);
    appointment.Subject = meetingTitle + " [ " + meetingRoomName + " ]";
    appointment.Body = new ews.TextBody(
      meetingTitle + " [ " + meetingRoomName + " ]"
    );
    appointment.Start = new ews.DateTime(meetingStartTime);
    appointment.End = new ews.DateTime(meetingEndTime);
    appointment.Location = meetingRoomName;
    appointment.RequiredAttendees.Add(meetingRoomAlias);
    appointment.OptionalAttendees.Add(meetingInvitees);

    appointment.Save(ews.SendInvitationsMode.SendToAllAndSaveCopy).then(
      function () {
        return "Calendar created successfully";
      },
      function (error) {
        console.log("Error in EWS_CREATE_MEETING_INVITE. Error=", error);
        return null;
      }
    );
  },
  // -------------------------------------------------------------------------
  EWS_FIND_AVAILABLE_ROOMS: function (
    room,
    meetingStartDateTime,
    meetingEndDateTime
  ) {
    return new Promise(function (r, j) {
      let ewsMeetingStartDate = new ews.DateTime(meetingStartDateTime),
        ewsMeetingEndDate = new ews.DateTime(meetingEndDateTime);
      var view = new ews.CalendarView(ewsMeetingStartDate, ewsMeetingEndDate);
      var calendarFolderId = new ews.FolderId(
        ews.WellKnownFolderName.Calendar,
        new ews.Mailbox(room.alias)
      );
      service.FindAppointments(calendarFolderId, view).then(
        (response) => {
          if (response.Items.length < 1) {
            r(room);
          } else {
            r("");
          }
        },
        (error) => {
          console.log(
            "Error in EWS_FIND_AVAILABLE_ROOMS. \n\n room=",
            room,
            " \n\n and Error=",
            error
          );
        }
      );
    });
  },
  // -------------------------------------------------------------------------
  EWS_FIND_ROOMS: async function (rooms, numPeople, startTime, endTime) {
    // get the availability of rooms for entire day
    const findDate = startTime.format("YYYY-MM-DD");
    const url = "https://graph.microsoft.com/v1.0/me/calendar/getschedule";
    const postData = {
      Schedules: Object.keys(rooms),
      StartTime: {
        dateTime: `${findDate}T08:00:00`,
        timeZone: "Asia/Singapore",
      },
      EndTime: {
        dateTime: `${findDate}T20:00:00`,
        timeZone: "Asia/Singapore",
      },
      availabilityViewInterval: "30",
    };
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(url, postData, { headers });

    // select timeSlot of the day
    const getSlot = (date) => {
      const parsedHour = parseInt(date.format("HH"), 10);
      const parsedMinute = parseInt(date.format("mm"), 10);
      return (parsedHour - 8) * 2 - 1 + (parsedMinute > 0 ? 1 : 0);
    };
    const startSlot = getSlot(startTime);
    const endSlot = getSlot(endTime);
    const numSlot = endSlot - startSlot;

    // select size of room
    const roomSize = numPeople > 8 ? "L" : "S";

    // duration of meeting
    const durStr = "0".repeat(numSlot);

    // find relevant rooms
    // match - exact match
    // timeMatch - room with closest match to the time
    // sizeMatch - room that match the time but of different size
    const roomsAvail = response.data.value;
    const chosenRooms = {
      match: null,
      timeMatch: {
        room: null,
        closeness: 100,
        startTime: null,
        endTime: null,
      },
      sizeMatch: null,
    };
    for (let room of roomsAvail) {
      const availView = room.availabilityView;
      const matchSize = roomSize === rooms[room.scheduleId].size;
      const matchTime = availView.slice(startSlot, endSlot) === durStr;
      if (matchSize && matchTime) {
        chosenRooms.match = rooms[room.scheduleId];
        break;
      } else if (matchTime) {
        chosenRooms.sizeMatch = rooms[room.scheduleId];
      } else if (matchSize) {
        // find closeness to the timeSlot - if any
        if (availView.includes(durStr)) {
          let closeness = 100;
          for (let time = 1; time <= 24 - startSlot - numSlot; time++) {
            if (
              availView.slice(startSlot + time, startSlot + time + numSlot) ===
              durStr
            ) {
              closeness = time;
              break;
            }
          }
          for (let time = 1; time <= 24 - endSlot - numSlot; time++) {
            if (closeness != 100 && time > closeness) break;
            if (
              availView.slice(endSlot - time - numSlot, endSlot - time) ===
              durStr
            ) {
              closeness = -time;
              break;
            }
          }
          if (closeness < chosenRooms.timeMatch.closeness) {
            const addTime = closeness * 30;
            chosenRooms.timeMatch = {
              room: rooms[room.scheduleId],
              closeness,
              startTime: convertTime(startTime.format(), addTime),
              endTime: convertTime(endTime.format(), addTime),
            };
          }
        }
      }
    }
    return chosenRooms;
  },
};
