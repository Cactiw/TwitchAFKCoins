
const fs = require("fs")
const dayjs = require('dayjs');

const browserService = require('./browserService')
const streamError = require('../model/errors/streamError')

const globals = require("../globals")
const User = require("../model/User")


async function watchStream(browser, page, user) {
    let firstRun = true
    let chestTimerId
    console.log("Watching stream!")
    while (globals.run_workers) {
        try {
            let newSpawn = await browserService.cleanup(browser, page, user.generateCookie());
            browser = newSpawn.browser;
            page = newSpawn.page;
            globals.firstRun = true;
            

            let watch = globals.channel;//streamers[getRandomInt(0, streamers.length - 1)]; //https://github.com/D3vl0per/Valorant-watcher/issues/27
            // let sleep = getRandomInt(globals.minWatching, globals.maxWatching) * 60000; //Set watching timer
            let sleep = Math.random() * 60000 * (globals.maxWatching - globals.minWatching) + globals.minWatching * 60000; //Set watching timer

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

            if (firstRun) {
                console.log('🔧 Closing KPop popup..');
                await browserService.clickWhenExist(page, globals.kPopClose)

                console.log('🔧 Closing subtember popup..');
                await browserService.clickWhenExist(page, globals.subtemberCancel);

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

                if (globals.greeting) {
                    if (user.checkGreeting()) {
                        console.log("Greeting, streamer!")
                        await sendToChat(page, randomChoice(openJsonFile(globals.resourcesPath).greetings))
                        user.setGreeted()
                        console.log("Greeted.")
                    } else {
                        console.log("Streamer already greeted!")
                    }
                }

                await tryFollow(browser, page)

                firstRun = false;
            }

            await browserService.clickWhenExist(page, globals.sidebarQuery); //Open sidebar
            try {
                await page.waitFor(globals.userStatusQuery, {timeout: 10000}); //Waiting for sidebar
            } catch (e) {
                console.log("Did not received userStatusQuery")
                await browserService.makeScreenshot(page, "ERROR" + generate_token())
                throw new streamError.TwitchLoginError("Wrong login")
            }
            let status = await browserService.queryOnWebsite(page, globals.userStatusQuery); //status jQuery
            await browserService.clickWhenExist(page, globals.sidebarQuery); //Close sidebar

            console.log('💡 Account status:', status[0] ? status[0].children[0].data : "Unknown");
            console.log('🕒 Time: ' + dayjs().format('HH:mm:ss'));
            console.log('💤 Watching stream for ' + sleep / 60000 + ' minutes\n');

            chestTimerId = setInterval(chest, 5000, page, watch)

            console.log("Sleeping for + ", sleep / 60000, " minutes")
            await page.waitFor(sleep);
            console.log("End of the sleep")
        } catch (e) {
            if (chestTimerId !== undefined) {
                clearInterval(chestTimerId)
                chestTimerId = undefined
            }

            if (e instanceof streamError.TwitchLoginError) {
                await browserService.makeScreenshot(page, "LOGIN ERROR" + generate_token())
            }

            await browserService.killBrowser(browser)

            if (e instanceof streamError.TwitchLoginError) {
                throw e
            }
            if (e instanceof streamError.StreamError) {
                throw e
            }
            console.log('🤬 Error: ', e);
            console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
        }
    }
}


async function tryFollow(browser, page) {
    return
    console.log("Trying to follow...")
    let result = await browserService.queryOnWebsite(page, globals.followButton);
    // console.log(result)

    if ((result[0] !== undefined) && result[0].type == 'tag' && result[0].name == 'button') {
        console.log("Not followed, following!")
        if (!globals.greeting) {
            await sendToChat(page, randomChoice(openJsonFile(globals.resourcesPath).greetings))
            await page.waitFor(1000)
        }
        await page.click(globals.followButton);
        await page.waitFor(500);
        console.log("Check!")
        return;
    } else {
        // await browserService.makeScreenshot(page, "Already followed " + generate_token())
    }
}


const delayMin = 5
const delayInterval = 20

async function startStreamWatching(account) {
    let user = new User.User(account.username, account.token)
    let waitBefore = (Math.random() * delayInterval + delayMin)
    console.log(`Launching stream worker after ${waitBefore} minutes`)
    // TODO RETURN
    // await sleep(waitBefore * 1000) // * 60)  TODO RETURN
    while (true) {
        let {browser, page} = await browserService.spawnBrowser(user.generateCookie())
        try {
            await watchStream(browser, page, user)
            await browserService.killBrowser(browser)
        } catch (e) {
            if (e instanceof streamError.StreamEndedError) {
                console.log("Exiting - stream ended")
                return
            } else if (e instanceof streamError.TwitchLoginError) {
                console.error("Wrong token, can not login: " + token)
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


async function checkStreamOnlineClean() {
    let {
        browser,
        page
    } = await browserService.spawnBrowser();

    await page.setViewport({ width: 1366, height: 768}); // to see the chat
    await page.goto(globals.baseUrl + globals.channel, {
        "waitUntil": "networkidle0"
    });
    await page.waitFor(5000)
    await browserService.clickWhenExist(page, globals.cookiePolicyQuery);
    await browserService.clickWhenExist(page, globals.matureContentQuery); //Click on accept button

    let result = await checkStreamOnline(page)
    if (result) {
        await browserService.makeScreenshot(page, "STREAM ONLINE" + generate_token())
    }

    await browserService.killBrowser(browser)

    return result
}


async function checkStreamOnline(page) {
    try {

        let streamStatus = await browserService.queryOnWebsite(page, globals.streamStatusQuery)
        let streamOtherStatus = await browserService.queryOnWebsite(page,globals.streamOtherStatusQuery)
        let streamOfflineStatus = await browserService.queryOnWebsite(page, globals.streamOfflineStatusQuery)
        try {
            if (streamOfflineStatus[0] !== undefined) {
                console.log("Stream offline!")
                return false
            }
        } catch (e) { }
        try {
            console.log("Stream is ", streamStatus[0].children[0].children[0].data, " ",
                streamOtherStatus[0].children[0].children[0].data)
            if (["Hosting", "Ретранслируется"].includes(streamOtherStatus[0].children[0].children[0].data)) {
                return false
            }
        } catch (e) {}
        return ["LIVE", "В ЭФИРЕ"].includes(streamStatus[0].children[0].children[0].data)
    } catch (e) {
        console.error(e)
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
            let token = generate_token()
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
    try {
        let coins = await browserService.queryOnWebsite(page, globals.streamCoins);
        let result = await browserService.queryOnWebsite(page, globals.streamCoinsChestQuery);
        coins = coins[0].childNodes[0].children[0].data;
        if (result[0].type == 'tag' && result[0].name == 'button') {
            await page.click(globals.streamCoinsChestQuery);
            await page.waitFor(500);
            // LogInFile(stream, "clicked, coins = " + coins);
        }
    } catch (e) {
    }
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

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generate_token() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function openJsonFile(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

module.exports = {
    'checkStreamOnline': checkStreamOnline,
    'checkStreamOnlineClean': checkStreamOnlineClean,
    'sendToChat': sendToChat,
    'chest': chest,
    'checkLogin': checkLogin,
    'getAllStreamer': getAllStreamer,
    'watchStream': watchStream,
    'startStreamWatching': startStreamWatching,
    'sleep': sleep,
    'randomChoice': randomChoice
}
