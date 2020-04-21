const { formRoomCard } = require("./webex_card_functions");

/**
 * Reproduce variables required for formatting into a Webex Room Card
 * @param {array} availableRoom Array of Rooms that are available
 * @param {string} selectedBuilding Selected Building eg. MBC
 * @param {string} startTime Start time of meeting
 */
exports.formatRoomsForWebex = async (
  availableRoom,
  selectedBuilding,
  startTime
) => {
  let markdown =
    "Following rooms are available at " + selectedBuilding + ": \n\n ";
  let availableRoom2 = [];

  for (let x = 0; x < availableRoom.length; x++) {
    markdown +=
      x +
      1 +
      ". " +
      availableRoom[x].name +
      "  [ " +
      availableRoom[x].description +
      " ]" +
      " \n\n";
    availableRoom2.push({
      c: x + 1,
      name: availableRoom[x].name,
      alias: availableRoom[x].alias,
      floor: availableRoom[x].floor,
      size: availableRoom[x].size,
      description: availableRoom[x].description,
    });
  }

  markdown += "\n\nChoose any *available* room number\n\n";

  let attachments = [
    await formRoomCard(selectedBuilding, availableRoom2, startTime),
  ];
  return { text: "Rooms found.", markdown, attachments };
};
