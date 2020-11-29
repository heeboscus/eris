const { Command, Group } = require('./src/command.js')
const { version } = require('./package.json')
require("./src/MonkeyPatch")

function escapeRegex(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const whenMentioned = function () { return [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`] }
const whenMentionedOr = function (basePrefix) {
    const f = function () {
        let p = [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`]
        if (typeof basePrefix === 'object') basePrefix.map(pre => { p.push(escapeRegex(pre)) })
        else if (typeof basePrefix === 'string') p.push(escapeRegex(basePrefix))
        else throw new Error(`Prefix must either be object (array) or string. Not ${typeof basePrefix}.`)
        return p
    }
    return f
}

const Hibiscus = {}
Hibiscus.Bot = require('./src/bot.js')
Hibiscus.CommandContext = require('./src/context.js')
Hibiscus.Category = require('./src/category.js')
Hibiscus.Checks = require('./src/checks.js')
Hibiscus.Command = Command
Hibiscus.Group = Group
Hibiscus.Utils = require('./src/utils.js')
Hibiscus.Embed = require('./src/embed.js')
Hibiscus.Errors = require("./src/errors.js")
Hibiscus.whenMentioned = whenMentioned
Hibiscus.whenMentionedOr = whenMentionedOr
Hibiscus.VERSION = version
module.exports = Hibiscus

