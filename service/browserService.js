
const cheerio = require('cheerio');
const treekill = require('tree-kill');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const inquirer = require('../input');


const globals = require('../globals')


async function spawnBrowser(cookie) {
    if (!cookie) {
        cookie = globals.cookie
    }
    console.log("=========================");
    console.log('📱 Launching browser...');
    let browser = await puppeteer.launch(globals.browserConfig);
    let page = await browser.newPage();

    // console.log('🔧 Setting User-Agent...');
    await page.setUserAgent(globals.userAgent); //Set userAgent

    // console.log('🔧 Setting auth token...');
    await page.setCookie(...cookie); //Set cookie

    // console.log('⏰ Setting timeouts...');
    await page.setDefaultNavigationTimeout(process.env.timeout || 0);
    await page.setDefaultTimeout(process.env.timeout || 0);

    if (globals.proxyAuth) {
        await page.setExtraHTTPHeaders({
            'Proxy-Authorization': 'Basic ' + Buffer.from(globals.proxyAuth).toString('base64')
        })
    }

    return {
        browser,
        page
    };
}


async function readLoginData() {
    const cookie = [{
        "domain": ".twitch.tv",
        "hostOnly": false,
        "httpOnly": false,
        "name": "auth-token",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "id": 1
    }];
    try {
        console.log('🔎 Checking config file...');

        if (fs.existsSync(globals.configPath)) {
            console.log('✅ Json config found!');
            let configFile = JSON.parse(fs.readFileSync(globals.configPath, 'utf8'));
            if (globals.proxy) globals.browserConfig.args.push('--proxy-server=' + proxy);
            globals.browserConfig.executablePath = configFile.exec;
            cookie[0].value = configFile.token || configFile.tokens[0];
            globals.tokens = configFile.tokens
            globals.channel = configFile.channel;

            if (typeof(configFile.greeting) != 'undefined' && configFile.greeting != null) {
                globals.greeting = configFile.greeting
            }

            return cookie;
        } else if (process.env.token) {
            console.log('✅ Env config found');

            if (globals.proxy) globals.browserConfig.args.push('--proxy-server=' + proxy);
            cookie[0].value = process.env.token; //Set cookie from env
            globals.browserConfig.executablePath = '/usr/bin/chromium-browser'; //For docker container

            return cookie;
        } else {
            console.log('❌ No config file found!');

            let input = await inquirer.askLogin();

            fs.writeFile(globals.configPath, JSON.stringify(input), function (err) {
                if (err) {
                    console.log(err);
                }
            });

            if (globals.proxy) globals.browserConfig.args[6] = '--proxy-server=' + proxy;
            globals.browserConfig.executablePath = input.exec;
            cookie[0].value = input.token;
            globals.stream = input.channel;

            return cookie;
        }
    } catch (err) {
        console.log('🤬 Error: ', err);
        console.log('Please visit my discord channel to solve this problem: https://discord.gg/s8AH4aZ');
    }
}


async function queryOnWebsite(page, query) {
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let $ = cheerio.load(bodyHTML);
    const jquery = $(query);
    return jquery;
}


async function clickWhenExist(page, query) {
    let result = await queryOnWebsite(page, query);

    try {
        if (result[0].type == 'tag' && result[0].name == 'button') {
            await page.click(query);
            await page.waitFor(500);
            return;
        }
    } catch (e) {
    }
}


async function scroll(page, times) {
    console.log('🔨 Emulating scrolling...');

    for (var i = 0; i < times; i++) {
        await page.evaluate(async (page) => {
            var x = document.getElementsByClassName("scrollable-trigger__wrapper");
            x[0].scrollIntoView();
        });
        await page.waitFor(globals.scrollDelay);
    }
}


async function cleanup(browser, page) {
    if (browser && page) {
        try {
            const pages = await browser.pages();
            await pages.map((page) => page.close());
            await treekill(browser.process().pid, 'SIGKILL');
        } catch (e) {
            console.error("Can not close browser: ", e)
        }
    }
    //await browser.close();
    return await spawnBrowser();
}


async function killBrowser(browser) {
    const pages = await browser.pages();
    await pages.map((page) => page.close());
    treekill(browser.process().pid, 'SIGKILL');
}


async function shutDown() {
    console.log("\n👋Bye Bye👋");
    globals.run_workers = false;
    process.exit();
}


async function makeScreenshot(page, name) {
    await page.waitFor(1000);
    fs.access(globals.screenshotFolder, error => {
        if (error) {
            fs.promises.mkdir(globals.screenshotFolder);
        }
    });
    await page.screenshot({
        path: `${globals.screenshotFolder}${name}.png`
    });
    console.log('📸 Screenshot created: ' + `${name}.png`);
}

module.exports = {
    'spawnBrowser': spawnBrowser,
    'readLoginData': readLoginData,
    'queryOnWebsite': queryOnWebsite,
    'clickWhenExist': clickWhenExist,
    'scroll': scroll,
    'cleanup': cleanup,
    'killBrowser': killBrowser,
    'shutDown': shutDown,
    'makeScreenshot': makeScreenshot
}
