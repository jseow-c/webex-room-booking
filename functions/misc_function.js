const fs = require("fs");
const path = require("path");

/**
 * Reads data from file and return data
 * @param {string} path Path to file eg. /home/ubuntu/data.txt
 */
const readFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

/**
 * Overwrites given data into given file relative to root directory
 * @param {string} file Name of file to be written
 * @param {object} data Data to be written into the file
 */
exports.fullOverwrite = (file) => async (data) => {
  const dataString = JSON.stringify(data);
  await fs.writeFileSync(path.join(__dirname, "../", file), dataString);
  return;
};

/**
 * Gets the token for Microsoft Graph
 */
exports.getToken = async () => {
  const rawBuffer = await readFile("resources/token.json");
  const originalData = JSON.parse(rawBuffer);
  return originalData.access_token;
};
