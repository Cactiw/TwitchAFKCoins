<div align="center">

# Twitch AFK Coins</h1>

> **Project forked and based on [this repository](https://github.com/D3vl0per/Valorant-watcher)**

> **Further work takes place in a private repository.**

AutoCollet coins without being on the stream ! \
**Work without any window open.**

##

</div>

## Features

- 🤖 Automatic coins collect
- 🎥 True HTTP Live Streaming support (Forget the #4000 error code)
- 🔐 Cookie-based login
- 📜 Auto accept cookie policy
- 🤐 Unmuted stream
- 🛡 Proxy option
- 📽 Automatic lowest possible resolution settings
- 🧰 Highly customizable codebase


## Requirements

 - Windows or Linux OS
 - Network connection (Should be obvious...)
 - [Nodejs](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/get-npm)
 
## Installation
🎥 [Tutorial video by Ziyad](https://youtu.be/bwzv7wT44Ds) 🎥
### Windows
1. Login to your twitch account
2. Open inspector(F12 or Ctrl+Shift+I) on main site
3. Find the stored cookie section
4. Copy **auth-token**
5. Clone this repo
6. Install Chromium
7. Usually the path to the Chromium executable is: C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
8. Install the dependencies with `npm install`
9. Start the program with `npm start`
### Linux
1. Login to your twitch account
2. Open inspector(F12 or Ctrl+Shift+I) on main site
3. Find the stored cookie section
4. Copy **auth-token**
5. Clone this repo
6. Install Chromium: [TUTORIAL 🤗](https://www.addictivetips.com/ubuntu-linux-tips/install-chromium-on-linux/)
7. Locate Chromium executable: `whereis chromium`
8. Install the dependencies with `npm install`
9. Start the program with `npm start`

## Troubleshooting

### How does the token look like?
auth-token: `rxk38rh5qtyw95fkvm7kgfceh4mh6u`
___


### Streamers.json is empty?

Try again with higher delay.
Default delay:
```javascript
const scrollDelay = 2000;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L15)
___
### Something went wrong?
Try non-headless mode. Set headless value to `true`, like this:
```javascript
const showBrowser = true;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L24)
___
### Proxy?

Yes, of course:
```javascript
const proxy = ""; // "ip:port" By https://github.com/Jan710
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L25)  

OR

With Docker env:
```
proxy=PROXY_IP_ADDRESS:PROXY_PORT
```
___
### Screenshot without non-headless mode
```javascript
const browserScreenshot = false;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L27)

## Donation

Go to [this repository](https://github.com/D3vl0per/Valorant-watcher)

## Disclaimer
This code is for educational and research purposes only.
Do not attempt to violate the law with anything contained here.
I will not be responsible for any illegal actions.
Reproduction and copy is authorised, provided the source is acknowledged.
