module.exports = {
  /**
   * Confirm Card Template
   * @param {string} roomName Name of Room
   * @param {string} roomDescription Description of Room
   * @param {string} meetingTitle Title of Room
   * @param {string} meetingDateTime Date of Meeting
   * @param {string} meetingOrganizer Meeting's organizer
   */
  CONFIRM_CARD: (
    roomName,
    roomDescription,
    meetingTitle,
    meetingDateTime,
    meetingOrganizer
  ) => ({
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        text: meetingTitle,
        size: "Large",
        weight: "Bolder",
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            items: [
              {
                type: "Image",
                style: "Default",
                url:
                  process.env.IMAGE_URL + roomName.replace(" ", "%20") + ".jpg",
                size: "large",
                separator: true,
              },
            ],
            width: "100px",
          },
          {
            type: "Column",
            items: [
              {
                type: "TextBlock",
                text: "Room:\n" + roomName,
                size: "medium",
                isSubtle: true,
                color: "good",
              },
              {
                type: "TextBlock",
                text: roomDescription,
                size: "small",
                isSubtle: true,
                spacing: "small",
              },
              {
                type: "TextBlock",
                text: meetingDateTime,
                spacing: "small",
                size: "small",
              },
              {
                type: "TextBlock",
                text: "Meeting Organizer: " + meetingOrganizer,
                isSubtle: true,
                color: "Accent",
              },
            ],
            width: "stretch",
          },
        ],
      },
    ],
  }),
  /**
   * List Room Card Template
   * @param {string} building Name of building
   * @param {string} startTime  Start time of meeting
   */
  listRoomCard: (building, startTime) => ({
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        weight: "Lighter",
        text: `Following rooms are available at ${building}`,
        size: "Medium",
        color: "Default",
        spacing: "ExtraLarge",
        horizontalAlignment: "Center",
        separator: true,
      },
      {
        type: "TextBlock",
        weight: "Lighter",
        text: `${startTime}`,
        size: "Small",
        color: "Default",
        spacing: "ExtraLarge",
        horizontalAlignment: "Center",
        separator: true,
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: "6-8 Seater Rooms",
                horizontalAlignment: "Center",
                color: "Accent",
              },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: "12-24 Seater Rooms",
                horizontalAlignment: "Center",
                color: "Accent",
              },
            ],
          },
        ],
      },
      {
        type: "TextBlock",
        weight: "Lighter",
        text: "Click on any room to book them",
        size: "Medium",
        color: "Default",
        spacing: "ExtraLarge",
        horizontalAlignment: "Center",
        separator: true,
      },
    ],
  }),
  /**
   * Book Room Card Template
   * @param {object} room Room to be booked
   * @param {datetime} dateTime  Start time of meeting
   * @param {string} duration Duration of meeting in minutes
   */
  bookCard: (room, dateTime, duration) => ({
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        text: "Booking Confirmation",
        weight: "Bolder",
        size: "Medium",
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: "auto",
            items: [
              {
                type: "Image",
                url: "https://img.icons8.com/color/48/000000/meeting-room.png",
                size: "Small",
                style: "Person",
              },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: room.name,
                weight: "Bolder",
                wrap: true,
              },
              {
                type: "TextBlock",
                spacing: "None",
                text: `${dateTime.format("DD MMM")}, ${dateTime.format(
                  "h:mmA"
                )} (${duration}mins)`,
                isSubtle: true,
                wrap: true,
              },
            ],
          },
        ],
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Floor:",
            value: room.floor,
          },
          {
            title: "Size:",
            value: room.size === "S" ? "Small" : "Large",
          },
          {
            title: "Seats:",
            value: room.description.split(" ")[0],
          },
          {
            title: "Boards:",
            value: room.description.split(",")[1].trim(),
          },
        ],
      },
      {
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: "Book",
            fontType: "Monospace",
            weight: "Bolder",
            horizontalAlignment: "Center",
          },
        ],
        style: "good",
        horizontalAlignment: "Center",
        selectAction: {
          type: "Action.Submit",
          data: {
            type: "book",
            room: room.name.split("-")[2],
            name: room.name,
            alias: room.alias,
            description: room.description,
            time: dateTime.format(),
            duration,
          },
        },
      },
    ],
  }),
  /**
   * List Room Card Template
   * @param {string} building Name of building
   * @param {string} startTime  Start time of meeting
   */
  alternativeMainCard: (contents) => {
    const body = [
      {
        type: "TextBlock",
        text: "Booking Confirmation",
        weight: "Bolder",
        size: "Medium",
      },
      {
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: "Could not find a room that fits your requirement",
            weight: "Bolder",
          },
        ],
        style: "attention",
      },
    ];
    for (i of contents) {
      body.push(i);
    }
    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.0",
      body,
    };
  },
  /**
   * Alternative Room Card Template
   * @param {object} room Room available for booking
   * @param {datetime} dateTime Start time of meeting
   * @param {number} duration Duration of meeting in minutes
   * @param {string} option Option number
   * @param {string} style given style of the card container
   */
  alternativeRoomCard: (room, dateTime, duration, option, style) => ({
    type: "Container",
    items: [
      {
        type: "TextBlock",
        text: option,
        weight: "Lighter",
        size: "Small",
      },
      {
        type: "TextBlock",
        text: room.name,
        weight: "Bolder",
        wrap: true,
      },
      {
        type: "TextBlock",
        spacing: "None",
        text: `${dateTime.format("DD MMM")}, ${dateTime.format(
          "h:mmA"
        )} (${duration}mins)`,
        isSubtle: true,
        wrap: true,
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Floor:",
            value: room.floor,
          },
          {
            title: "Size:",
            value: room.size === "S" ? "Small" : "Large",
          },
          {
            title: "Seats:",
            value: room.description.split(" ")[0],
          },
          {
            title: "Boards:",
            value: room.description.split(",")[1].trim(),
          },
        ],
      },
      {
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: "Book",
            fontType: "Monospace",
            weight: "Bolder",
            horizontalAlignment: "Center",
          },
        ],
        style: "good",
        horizontalAlignment: "Left",
        selectAction: {
          type: "Action.Submit",
          data: {
            type: "book",
            room: room.name.split("-")[2],
            name: room.name,
            alias: room.alias,
            description: room.description,
            time: dateTime.format(),
            duration,
          },
        },
      },
    ],
    style,
  }),
  /**
   * Room Container Card Template
   * @param {object} room Room to be booked
   * @param {datetime} startTime Time of Meeting
   */
  roomContainer: (room, startTime) => ({
    type: "Container",
    items: [
      {
        type: "TextBlock",
        text: room.name,
        horizontalAlignment: "Center",
        size: "Medium",
        weight: "Bolder",
      },
    ],
    style: "accent",
    selectAction: {
      type: "Action.Submit",
      data: {
        type: "book",
        room: room.name,
        name: room.actualName,
        alias: room.alias,
        description: room.description,
        time: startTime,
      },
    },
  }),
};
