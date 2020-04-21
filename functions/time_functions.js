const moment = require("moment-timezone");
moment.locale("en");

/**
 * Converts datetime from ISO string format to moment.js version.
 * (Optional) you may add x minutes to this particular rendition
 * @param {string} dateTime ISO string format of a datetime
 * @param {number} mins (optional) Number of minutes to be added to this datetime
 */
exports.convertTime = (dateTime, mins = null) => {
  if (mins) {
    return moment(new Date(dateTime))
      .tz(process.env.TZ, true)
      .add(mins, "minutes");
  } else {
    return moment(new Date(dateTime)).tz(process.env.TZ, true);
  }
};
