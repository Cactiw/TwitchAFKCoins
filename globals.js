
exports.showBrowser = false; // false state equ headless mode;

exports.browserConfig = {
    headless: !this.showBrowser,
    args: [
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
}; //https://github.com/D3vl0per/Valorant-watcher/issues/24


exports.proxy = (process.env.proxy || ""); // "ip:port" By https://github.com/Jan710
exports.proxyAuth = (process.env.proxyAuth || "");

exports.browserScreenshot = false;//(process.env.browserScreenshot || false);

exports.scrollDelay = (Number(process.env.scrollDelay) || 2000);
exports.scrollTimes = (Number(process.env.scrollTimes) || 5);

exports.configPath = './config.json'
exports.resourcesPath = './resources.json'
exports.logPath = './logs.log'
exports.screenshotFolder = './screenshots/';
exports.baseUrl = 'https://www.twitch.tv/';
exports.userAgent = (process.env.userAgent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

exports.minWatching = (Number(process.env.minWatching) || 15); // Minutes
exports.maxWatching = (Number(process.env.maxWatching) || 30); //Minutes

exports.streamerListRefresh = (Number(process.env.streamerListRefresh) || 1);
exports.streamerListRefreshUnit = (process.env.streamerListRefreshUnit || 'hour'); //https://day.js.org/docs/en/manipulate/add


exports.browserClean = 1;
exports.browserCleanUnit = 'hour';

exports.greeting = true

exports.cookie = null;
exports.run_monitor = true;
exports.run_workers = true;
exports.firstRun = true;
exports.streamers = null;
exports.channel = '';
exports.tokens = []

exports.cookiePolicyQuery = 'button[data-a-target="consent-banner-accept"]';
exports.matureContentQuery = 'button[data-a-target="player-overlay-mature-accept"]';
exports.sidebarQuery = '*[data-test-selector="user-menu__toggle"]';
exports.userStatusQuery = 'span[data-a-target="presence-text"]';
exports.channelsQuery = 'a[data-test-selector*="ChannelLink"]';
exports.streamPauseQuery = 'button[data-a-target="player-play-pause-button"]';
exports.streamSettingsQuery = '[data-a-target="player-settings-button"]';
exports.streamQualitySettingQuery = '[data-a-target="player-settings-menu-item-quality"]';
exports.streamQualityQuery = 'input[data-a-target="tw-radio"]';
exports.streamCoinsChestQuery = 'button[class="tw-button tw-button--success tw-interactive"]';
exports.streamCoins = '[data-test-selector="balance-string"]';
exports.streamStatusQuery = 'div [class="0 tw-align-center tw-border-radius-medium tw-channel-status-text-indicator tw-channel-status-text-indicator--live tw-font-size-6 tw-inline-block"]'
exports.streamOfflineStatusQuery = 'div[class="channel-status-info channel-status-info--offline tw-border-radius-medium tw-inline-block"]'
exports.streamOtherStatusQuery = 'div[class="channel-status-info channel-status-info--hosting tw-border-radius-medium tw-inline-block"]'
exports.subtemberCancel = 'div[class="tw-absolute tw-pd-1 tw-right-0 tw-top-0"] button'
exports.kPopClose = 'button[class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-small tw-border-bottom-right-radius-small tw-border-top-left-radius-small tw-border-top-right-radius-small tw-button-icon tw-button-icon--secondary tw-button-icon--small tw-core-button tw-core-button--small tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"]'
// exports.followButton = 'div[class="tw-border-radius-medium tw-c-background-accent-alt-2 tw-inline-flex tw-overflow-hidden"] button'
exports.followButton = 'button[class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--primary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"]'
exports.cancelFollowButton = 'div[class="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden"] button'
exports.chatTextArea = 'div[class="chat-input__textarea"] textarea'
exports.chatRulesAccept = 'button[class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-large tw-border-bottom-right-radius-large tw-border-top-left-radius-large tw-border-top-right-radius-large tw-core-button tw-core-button--large tw-core-button--primary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"]'
exports.chatRulesAcceptQuery = '[data-a-target="tw-core-button-label-text"]'

