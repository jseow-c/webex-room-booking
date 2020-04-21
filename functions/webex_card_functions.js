const {
  CONFIRM_CARD,
  listRoomCard,
  roomContainer,
} = require("../templates/room_card");

module.exports = {
  /**
   * Creates Confirm Card Template
   * @param {string} roomName Name of Room
   * @param {string} roomDescription Description of Room
   * @param {string} meetingTitle Title of Meeting
   * @param {string} meetingDateTime Time of Meeting
   * @param {string} meetingOrganizer Name of Meeting Organizer
   */
  CREATE_CONFIRM_CARD: async (
    roomName,
    roomDescription,
    meetingTitle,
    meetingDateTime,
    meetingOrganizer
  ) => {
    const card = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: CONFIRM_CARD(
        roomName,
        roomDescription,
        meetingTitle,
        meetingDateTime,
        meetingOrganizer
      ),
    };
    return card;
  },
  /**
   * Create Rooms Card Template
   * @param {string} building Name of Building
   * @param {array} RoomArray Arrays of Rooms to be selected
   * @param {datetime} startTime Time of Meeting to book
   */
  formRoomCard: async (building, RoomArray, startTime) => {
    // setup main card template
    const card = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: listRoomCard(building, startTime),
    };

    const EWS_List_Small_Rooms = {};
    const EWS_List_Large_Rooms = {};

    /**
     * format room according for later usage
     * @param {array} array array of rooms
     * @param {number} index index of selected room
     */
    const formatRoomToList = (array, index) => ({
      c: array[index].c,
      name: array[index].name.split("-")[2],
      actualName: array[index].name,
      alias: array[index].alias,
      description: array[index].description,
    });

    // Fills in 2 objects based on room size
    if (RoomArray.length > 0) {
      await new Promise((resolve) => {
        for (let x = 0; x < RoomArray.length; x++) {
          if (RoomArray[x].size === "S") {
            if (EWS_List_Small_Rooms.hasOwnProperty(RoomArray[x].floor)) {
              EWS_List_Small_Rooms[RoomArray[x].floor].push(
                formatRoomToList(RoomArray, x)
              );
            } else {
              EWS_List_Small_Rooms[RoomArray[x].floor] = [];
              EWS_List_Small_Rooms[RoomArray[x].floor].push(
                formatRoomToList(RoomArray, x)
              );
            }
          } else if (RoomArray[x].size === "L") {
            if (EWS_List_Large_Rooms.hasOwnProperty(RoomArray[x].floor)) {
              EWS_List_Large_Rooms[RoomArray[x].floor].push(
                formatRoomToList(RoomArray, x)
              );
            } else {
              EWS_List_Large_Rooms[RoomArray[x].floor] = [];
              EWS_List_Large_Rooms[RoomArray[x].floor].push(
                formatRoomToList(RoomArray, x)
              );
            }
          }

          if (x + 1 === RoomArray.length) {
            resolve();
          }
        }
      });

      // creates room card template based on small rooms
      if (Object.keys(EWS_List_Small_Rooms).length > 0) {
        await new Promise((resolve) => {
          for (let y = 0; y < Object.keys(EWS_List_Small_Rooms).length; y++) {
            card.content.body[2].columns[0].items.push({
              type: "TextBlock",
              text: "LEVEL " + Object.keys(EWS_List_Small_Rooms)[y],
              horizontalAlignment: "Center",
              spacing: "Medium",
              color: "Good",
              separator: true,
            });
            for (
              let z = 0;
              z <
              EWS_List_Small_Rooms[Object.keys(EWS_List_Small_Rooms)[y]].length;
              z++
            ) {
              const roomKey = Object.keys(EWS_List_Small_Rooms)[y];
              const room = EWS_List_Small_Rooms[roomKey][z];
              const cardItems = card.content.body[2].columns[0].items;
              cardItems.push(roomContainer(room, startTime));
            }
            if (y + 1 === Object.keys(EWS_List_Small_Rooms).length) {
              resolve();
            }
          }
        });
      }

      // creates room card template based on large rooms
      if (Object.keys(EWS_List_Large_Rooms).length > 0) {
        await new Promise((resolve) => {
          for (let y = 0; y < Object.keys(EWS_List_Large_Rooms).length; y++) {
            card.content.body[2].columns[1].items.push({
              type: "TextBlock",
              text: "LEVEL" + Object.keys(EWS_List_Large_Rooms)[y],
              horizontalAlignment: "Center",
              spacing: "Medium",
              color: "Good",
              separator: true,
            });
            for (
              let z = 0;
              z <
              EWS_List_Large_Rooms[Object.keys(EWS_List_Large_Rooms)[y]].length;
              z++
            ) {
              const roomKey = Object.keys(EWS_List_Large_Rooms)[y];
              const room = EWS_List_Large_Rooms[roomKey][z];
              const cardItems = card.content.body[2].columns[1].items;
              cardItems.push(roomContainer(room, startTime));
            }
            if (y + 1 === Object.keys(EWS_List_Large_Rooms).length) {
              resolve();
            }
          }
        });
      }
    } else {
      // no rooms scenario
      card.content.body[2].columns[0].items.push({
        type: "TextBlock",
        text: "No Rooms available",
        horizontalAlignment: "Center",
        spacing: "Medium",
        color: "Good",
        separator: true,
      });
      card.content.body[2].columns[1].items.push({
        type: "TextBlock",
        text: "No Rooms available",
        horizontalAlignment: "Center",
        spacing: "Medium",
        color: "Good",
        separator: true,
      });
    }
    return card;
  },
};
