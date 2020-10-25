
const category = require('./src/category.js')

const command = require('./src/command.js')
const embed = require('./src/embed.js')
const utils = require('./src/utils.js')
const bot = require('./src/bot.js')

function escapeRegex(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const whenMentioned = function() {return [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`]}
const whenMentionedOr = function(basePrefix) {
    const f = function() {
        p = [`<@${this.user.id}> `, `<@!${this.user.id}> `, `<@${this.user.id}>`, `<@!${this.user.id}>`]
        if (typeof basePrefix === 'object') basePrefix.map(pre => {p.push(escapeRegex(pre))})
        else if (typeof basePrefix === 'string') p.push(escapeRegex(basePrefix))
        else throw new Error(`Prefix must either be object (array) or string. Not ${typeof basePrefix}.`)
        return p
    }
    return f
}

/**
 * @description uwu
 * @namespace Hibiscus
 */
module.exports = {
    Bot: bot, 
    Command: command,
    Category: category,
    Utils: utils,
    Embed: embed, 
    whenMentioned: whenMentioned, 
    whenMentionedOr: whenMentionedOr
}

