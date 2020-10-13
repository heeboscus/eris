
const category = require('./src/category.js')
const command = require('./src/command.js')
const embed = require('./src/embed.js')
const bot = require('./src/bot.js')


exports.Bot = bot
exports.Category = category
exports.Command = command
exports.Embed = embed


function escapeRegex(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


exports.whenMentioned = function() {return [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`]}
exports.whenMentionedOr = function(basePrefix) {
    const f = function() {
        p = [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`]
        if (typeof basePrefix === 'object') basePrefix.map(pre => {p.push(escapeRegex(pre))})
        else if (typeof basePrefix === 'string') p.push(escapeRegex(basePrefix))
        else throw new Error(`Prefix must either be object or string. Not ${typeof basePrefix}.`)
        return p
    }
    return f
}
