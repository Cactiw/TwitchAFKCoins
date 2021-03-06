const inquirer = require('inquirer');
exports.askLogin = () => {
  const questions = [{
    name: 'token',
    type: 'password',
    message: 'Enter your auth-token from twitch.tv 🔑:',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your valid token!';
      }
    }
  }, {
    name: 'exec',
    type: 'input',
    message: 'Enter the chromium executable path (usually /usr/bin/chromium-browser or /usr/bin/chromium or C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe):',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your valid path!';
      }
    }
  }, {
    name: 'channel',
    type: 'input',
    message: 'Enter the channel name (same as in the url, can be changed in the config.json):',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter a valid name!';
      }
    }
  }];
  return inquirer.prompt(questions);
};
