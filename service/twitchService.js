
const fs = require("fs")

const browserService = require('./browserService')

const globals = require("../globals")


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

module.exports = {
    'checkStreamOnline': checkStreamOnline,
    'sendToChat': sendToChat,
    'chest': chest,
    'checkLogin': checkLogin,
    'getAllStreamer': getAllStreamer
}
