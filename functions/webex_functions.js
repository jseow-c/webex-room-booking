const axios = require("axios");

module.exports = {
  /**
   * Get person's details based on his Webex ID
   * @param {string} wxPersonId Webex ID of user
   */
  WX_GET_PERSON_DETAILS: function (wxPersonId) {
    return new Promise(function (r, j) {
      let p = {
        url: "https://api.ciscospark.com/v1/people/" + wxPersonId,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.WEBEX_KEY,
        },
        agent: false,
        encoding: "utf-8",
      };
      axios(p)
        .then((d) => {
          r(d.data);
        })
        .catch((e) => {
          console.log("Error in WX_GET_PERSON_DETAILS. Error=", e);
          j(e);
        });
    });
  },
};
