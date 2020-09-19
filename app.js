require('dotenv').config();
require('fs.promises')
const dayjs = require('dayjs');
const fs = require('fs');

const twitchService = require("./service/twitchService")
const browserService = require("./service/browserService")
const globals = require("./globals")


async function viewRandomPage(browser, page) {
  let streamer_last_refresh = dayjs().add(globals.streamerListRefresh, globals.streamerListRefreshUnit);
  let browser_last_refresh = dayjs().add(globals.browserClean, globals.browserCleanUnit);
  while (globals.run) {
    try {
      if (dayjs(browser_last_refresh).isBefore(dayjs())) {
        let newSpawn = await browserService.cleanup(browser, page);
        browser = newSpawn.browser;
        page = newSpawn.page;
        globals.firstRun = true;
        browser_last_refresh = dayjs().add(globals.browserClean, globals.browserCleanUnit);
      }

      let watch = globals.channel;//streamers[getRandomInt(0, streamers.length - 1)]; //https://github.com/D3vl0per/Valorant-watcher/issues/27
      let sleep = getRandomInt(globals.minWatching, globals.maxWatching) * 60000; //Set watching timer

      console.log('\n🔗 Now watching streamer: ', globals.baseUrl + watch);

      await page.setViewport({ width: 1366, height: 768}); // to see the chat
      await page.goto(globals.baseUrl + watch, {
        "waitUntil": "networkidle0"
      }); //https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagegobackoptions

      console.log('Checking stream status...')
      if (await twitchService.checkStreamOnline(page) === true) {
        console.log('Stream online!')
      } else {
        console.log('Stream offline, exiting')
        await browserService.shutDown()
      }

      await browserService.clickWhenExist(page, globals.cookiePolicyQuery);
      await browserService.clickWhenExist(page, globals.matureContentQuery); //Click on accept button

      if (globals.firstRun) {
        console.log('🔧 Closing subtember popup..');
        await browserService.clickWhenExist(page, globals.subtemberCancel);

        console.log('🔧 Setting lowest possible resolution..');
        await browserService.clickWhenExist(page, globals.streamPauseQuery);

        await browserService.clickWhenExist(page, globals.streamSettingsQuery);
        await page.waitFor(globals.streamQualitySettingQuery);

        await browserService.clickWhenExist(page, globals.streamQualitySettingQuery);
        await page.waitFor(globals.streamQualityQuery);

        let resolution = await browserService.queryOnWebsite(page, globals.streamQualityQuery);
        resolution = resolution[resolution.length - 1].attribs.id;
        await page.evaluate((resolution) => {
          document.getElementById(resolution).click();
        }, resolution);

        await browserService.clickWhenExist(page, globals.streamPauseQuery);

        await page.keyboard.press('m'); //For unmute

        // await sendToChat(page, "Привет!")

        globals.firstRun = false;
      }

      await browserService.clickWhenExist(page, globals.sidebarQuery); //Open sidebar
      await page.waitFor(globals.userStatusQuery); //Waiting for sidebar
      let status = await browserService.queryOnWebsite(page, globals.userStatusQuery); //status jQuery
      await browserService.clickWhenExist(page, globals.sidebarQuery); //Close sidebar

      console.log('💡 Account status:', status[0] ? status[0].children[0].data : "Unknown");
      console.log('🕒 Time: ' + dayjs().format('HH:mm:ss'));
      console.log('💤 Watching stream for ' + sleep / 60000 + ' minutes\n');

      console.log("Trying to follow...")
      await browserService.clickWhenExist(page, globals.followButton)
      console.log("Check!")

      await twitchService.chest(page, watch, 5000);

      await page.waitFor(sleep);
    } catch (e) {
      console.log('🤬 Error: ', e);
      console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
    }
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


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  console.log('🔭 Running watcher...');
  await viewRandomPage(browser, page);
}

main();

process.on("SIGINT", browserService.shutDown);
process.on("SIGTERM", browserService.shutDown);
