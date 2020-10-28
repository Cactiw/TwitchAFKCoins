module.exports = {
  apps : [{
    name: 'TwitchBooster',
    script: 'app.js',
    log_file: 'TwitchBooster.log',
    time: true,
    kill_timeout: 5000,

    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '7000M',
  }
  ]
};