
const fs = require("fs")
const dayjs = require('dayjs');

const browserService = require('./browserService')
const streamError = require('../model/errors/streamError')

const globals = require("../globals")


async function watchStream(browser, page) {
    console.log("Watching stream!")
    let streamer_last_refresh = dayjs().add(globals.streamerListRefresh, globals.streamerListRefreshUnit);
    let browser_last_refresh = dayjs().add(globals.browserClean, globals.browserCleanUnit);
    while (globals.run_workers) {
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
            if (await checkStreamOnline(page) === true) {
                console.log('Stream online!')
            } else {
                console.log('Stream offline, exiting')
                await endStreamWatching()
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

                console.log("Trying to follow...")
                await browserService.clickWhenExist(page, globals.followButton)
                console.log("Check!")

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

            await chest(page, watch, 5000);

            await page.waitFor(sleep);
        } catch (e) {
            console.log('🤬 Error: ', e);
            console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
        }
    }
}


const delayMin = 5
const delayInterval = 20

async function startStreamWatching(token) {
    const cookie = JSON.parse(JSON.stringify(globals.cookie))
    cookie[0].value = token

    let waitBefore = (Math.random() * delayInterval + delayMin)
    console.log(`Launching stream worker after ${waitBefore} minutes`)
    await sleep(waitBefore * 1000 * 60)
    while (true) {
        try {
            let {browser, page} = await browserService.spawnBrowser(cookie)
            await watchStream(browser, page)
        } catch (e) {
            if (e instanceof streamError.StreamEndedError) {
                console.log("Exiting - stream ended")
                return
            }
            console.error("Error during watching stream, relaunching:", e.toString())
        }
        await sleep(1000)
    }
}


async function endStreamWatching() {
    console.log("\n👋Exiting worker👋");
    throw new streamError.StreamEndedError();
}


async function checkStreamOnline(page) {
    try {
        let streamStatus = await browserService.queryOnWebsite(page, globals.streamStatusQuery)
        return streamStatus[0].children[0].children[0].data === "LIVE"
    } catch (e) {
        return false
    }
}

async function sendToChat(page, word) {
    let result = await browserService.queryOnWebsite(page, globals.chatTextArea)

    try {
        if (result[0].type == 'tag' && result[0].name == "textarea") {
            console.log("Отправляю в чат " + word)
            await page.click(globals.chatTextArea)

            let chatRules = await browserService.queryOnWebsite(page, globals.chatRulesAccept)
            if ((chatRules[0] !== undefined) && chatRules[0].type == "tag" && chatRules[0].name == "button") {
                console.log("Accepting chat rules...")
                await browserService.clickWhenExist(page, globals.chatRulesAccept)
                await page.waitFor(globals.chatRulesAcceptQuery)
                console.log("Chat rules accepted!")
                await page.click(globals.chatTextArea)
            }
            let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await browserService.makeScreenshot(page, token + 1)
            await page.keyboard.type(word)
            await page.waitFor(2500)
            await browserService.makeScreenshot(page, token + 2)
            console.log("Жму энтер")
            await browserService.makeScreenshot(page, token + 3)
            await page.keyboard.press('Enter');
            await browserService.makeScreenshot(page, token + 4)
            console.log("Отправил!")
        }
    } catch (e) {
        console.error(e)
    }
}

async function chest(page, stream, interval) {
    let coins = await browserService.queryOnWebsite(page, globals.streamCoins);
    let result = await browserService.queryOnWebsite(page, globals.streamCoinsChestQuery);
    coins = coins[0].childNodes[0].children[0].data;

    try {
        if (result[0].type == 'tag' && result[0].name == 'button') {
            await page.click(globals.streamCoinsChestQuery);
            await page.waitFor(500);
            interval = 240000;
            // LogInFile(stream, "clicked, coins = " + coins);
        }
    } catch (e) {
    }
    await page.waitFor(interval);
    await chest(page, stream, interval);
}


async function checkLogin(page) {
    let cookieSetByServer = await page.cookies();
    for (var i = 0; i < cookieSetByServer.length; i++) {
        if (cookieSetByServer[i].name == 'twilight-user') {
            console.log('✅ Login successful!');
            return true;
        }
    }
    console.log('🛑 Login failed!');
    console.log('🔑 Invalid token!');
    console.log('\nPleas ensure that you have a valid twitch auth-token.\nhttps://github.com/D3vl0per/Valorant-watcher#how-token-does-it-look-like');
    if (!process.env.token) {
        fs.unlinkSync(globals.configPath);
    }
    process.exit();
}


async function getAllStreamer(page) {
    console.log("=========================");
    await page.goto(globals.streamersUrl, {
        "waitUntil": "networkidle0"
    });
    console.log('🔐 Checking login...');
    await checkLogin(page);
    console.log('📡 Checking active streamers...');
    await scroll(page, globals.scrollTimes);
    const jquery = await browserService.queryOnWebsite(page, globals.channelsQuery);
    globals.streamers = null;
    globals.streamers = new Array();

    console.log('🧹 Filtering out html codes...');
    for (let i = 0; i < jquery.length; i++) {
        globals.streamers[i] = jquery[i].attribs.href.split("/")[1];
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    'checkStreamOnline': checkStreamOnline,
    'sendToChat': sendToChat,
    'chest': chest,
    'checkLogin': checkLogin,
    'getAllStreamer': getAllStreamer,
    'watchStream': watchStream,
    'startStreamWatching': startStreamWatching,
    'sleep': sleep
}
