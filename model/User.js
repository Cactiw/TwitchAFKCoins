
const fs = require("fs")

const globals = require("../globals")


class User {
    constructor(username, token) {
        this.username = username
        this.token = token
        this.storage = new UserStorage(username)
    }

    checkGreeting() {
        return (!this.storage.lastGreeted || Date.now() - this.storage.lastGreeted > 8 * 1000 * 60 * 60)
    }

    setGreeted() {
        this.storage.lastGreeted = Date.now()
        this.saveStorage()
    }

    generateCookie() {
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
        cookie[0].value = this.token
        return JSON.parse(JSON.stringify(cookie))
    }
    saveStorage() {
        this.storage.save()
    }
}


class UserStorage {
    constructor(username) {
        this.username = username
        this.lastGreeted = null
        this.proxy = null

        this.currentPath = globals.storagePath + this.username + ".json"

        this.load()
    }

    load() {
        if (fs.existsSync(this.currentPath)) {
            console.log('✅ Json storage found!');
            let storageFile = JSON.parse(fs.readFileSync(this.currentPath, 'utf8'));
            if (storageFile.lastGreeted) {
                this.lastGreeted = storageFile.lastGreeted
            } else {
                this.lastGreeted = null
            }
            this.proxy = storageFile.proxy
        } else {
            console.log("New user! Creating config!")
            this.save()
        }
    }

    save() {
        fs.writeFileSync(this.currentPath, JSON.stringify(this))
    }
}

exports.User = User
