require('dotenv').config();
require('fs.promises')
const fs = require('fs');

const twitchService = require("./service/twitchService")
const browserService = require("./service/browserService")
const globals = require("./globals")


const checkInterval = 5 * 1000 * 60

async function monitorStreamStatus() {
  let online = false
  while (globals.run_monitor) {
    console.log('\n🔗 Now checking status of the streamer: ', globals.baseUrl + globals.channel);
    let streamOnline = await twitchService.checkStreamOnlineClean()
    if (streamOnline === true) {
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
  process.on('unhandledRejection', function(err, promise) {
    console.error('Unhandled rejection (promise: ', promise, ', reason: ', err, ').');
  });

  process.on("SIGINT", browserService.shutDown);
  process.on("SIGTERM", browserService.shutDown);
  process.on('warning', e => console.warn(e.stack));

  console.clear();
  console.log("=========================");
  globals.cookie = await browserService.readLoginData();

  if (process.argv.includes("--debug")) {
    await twitchService.startStreamWatching(globals.tokens[0])
    return
  }
  //await getAllStreamer(page);
  console.log("=========================");
  console.log('🔭 Running monitor...');
  await monitorStreamStatus();
}

main();

//
// "Хорошо здоровается тот, кто здоровается первым.",
//     "Есть люди, с которыми приятно поздороваться дважды.",
//     "Приветствуй себя, и тебе ответит приветствием весь мир.",
//     "Хочу просто поздороваться со всеми.:)И улыбнуться.:)",
//     "Рад снова оказаться здесь!",
//     "Привет! Залипну до конца на стримчике."
