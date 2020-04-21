const puppeteer = require("puppeteer");
const misc = require("./misc_function");

const overwrite = misc.fullOverwrite("resources/token.json");

/**
 * Simple function to sleep/wait. Similar to Python's sync sleep function
 * @param {number} ms milliseconds to sleep
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Gets Token from Microsoft Graph API using web-crawling technique
 */
exports.save_token = async () => {
  // initialize operation
  console.log("Getting Token");
  const browser = await puppeteer.launch();
  let accessToken = null;

  // Insert a try/catch to ensure browser and token is always closed/removed
  try {
    // Create a new incognito browser context.
    const context = await browser.createIncognitoBrowserContext();

    // Create a new page in a pristine context.
    const page = await context.newPage();

    // Go to Microsoft Graph API
    await page.goto(
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_mode=fragment&nonce=graph_explorer&prompt=select_account&mkt=en-US&client_id=de8bc8b5-d9f9-48b1-a8ad-b748da725064&response_type=token&redirect_uri=https%3A%2F%2Fdeveloper.microsoft.com%2Fen-us%2Fgraph%2Fgraph-explorer&state=%7B%22client_id%22%3A%22de8bc8b5-d9f9-48b1-a8ad-b748da725064%22%2C%22network%22%3A%22msft%22%2C%22display%22%3A%22page%22%2C%22callback%22%3A%22_hellojs_35rha5ww%22%2C%22state%22%3A%22%22%2C%22redirect_uri%22%3A%22https%3A%2F%2Fdeveloper.microsoft.com%2Fen-us%2Fgraph%2Fgraph-explorer%22%7D&scope=openid%20profile%20User.ReadWrite%20User.ReadBasic.All%20Sites.ReadWrite.All%20Contacts.ReadWrite%20People.Read%20Notes.ReadWrite.All%20Tasks.ReadWrite%20Mail.ReadWrite%20Files.ReadWrite.All%20Calendars.ReadWrite"
    );

    // Start of Web Scraping
    // Page 1 - Input Email
    await page.waitForSelector("input#i0116[type=email]");
    await page.type("input#i0116[type=email]", process.env.EWS_READ_EMAIL);
    await page.click("input#idSIButton9");

    // Page 2 - Wait for Redirection
    let maxTries = 20;
    while (!accessToken && maxTries > 0) {
      const pageUrl = page.url();
      if (pageUrl.includes("login.srf")) {
        // Reached Redirected URL
        await page.waitForSelector("input#idBtn_Back");
        await page.click("input#idBtn_Back");
        break;
      }
      maxTries = maxTries - 1;
      await sleep(1500);
    }

    // Page 3 - Wait for TargetUrl
    maxTries = 20;
    while (!accessToken && maxTries > 0) {
      let pageUrl = await page.evaluate("location.href");
      pageUrl = pageUrl.replace("#", "?");
      if (pageUrl.includes("access_token")) {
        // Reached Target URL
        const parsedUrl = new URL(pageUrl);
        const parsedCode = parsedUrl.searchParams.get("access_token");
        console.log(`Gotten Code at ${new Date().toISOString()}`);
        overwrite({ access_token: parsedCode });
        break;
      }
      maxTries = maxTries - 1;
      await sleep(1000);
    }
  } catch (e) {
    console.log(e);
  }

  await browser.close();
};
