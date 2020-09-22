require('dotenv').config();
require('fs.promises')
const fs = require('fs');

const twitchService = require("./service/twitchService")
const browserService = require("./service/browserService")
const globals = require("./globals")


const checkInterval = 5 * 1000 * 60

async function monitorStreamStatus(browser, page) {
  let online = false
  while (globals.run_monitor) {
    console.log('\n🔗 Now checking status of the streamer: ', globals.baseUrl + globals.channel);

    await page.setViewport({ width: 1366, height: 768}); // to see the chat
    await page.goto(globals.baseUrl + globals.channel, {
      "waitUntil": "networkidle0"
    });
    await browserService.clickWhenExist(page, globals.cookiePolicyQuery);
    await browserService.clickWhenExist(page, globals.matureContentQuery); //Click on accept button

    if (await twitchService.checkStreamOnline(page) === true) {
      if (online) {
        console.log("Stream is still running")
      } else {
        console.log("✅Stream appeared online! Launching all!")
        online = true
        let res = await Promise.allSettled(globals.tokens.map(twitchService.startStreamWatching))
      }
    } else {
      if (online) {
        console.log('Stream became offline')
        globals.run_workers = false
        online = false
      } else {
        console.log("Stream is still offline")
      }
    }

    let newBrowser = await browserService.cleanup(browser, page);
    browser = newBrowser.browser
    page = newBrowser.page
    await twitchService.sleep(checkInterval)
  }
}


function LogInFile(stream, message) {
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;

  if (fs.existsSync(globals.logPath)) {
    console.log(message);
    console.log("✅ "+ dateTime + "Collected");
    fs.appendFile(globals.logPath, dateTime + " - " + stream + " : " + message + '\n', function(err) {});
  } else {
    console.log("❌ No log file found!");
  }
}


async function main() {
  console.clear();
  console.log("=========================");
  globals.cookie = await browserService.readLoginData();
  let {
    browser,
    page
  } = await browserService.spawnBrowser();
  //await getAllStreamer(page);
  console.log("=========================");
  console.log('🔭 Running monitor...');
  await monitorStreamStatus(browser, page);
}


process.on("SIGINT", browserService.shutDown);
process.on("SIGTERM", browserService.shutDown);
process.on('warning', e => console.warn(e.stack));

await main();
