/* 
Copyright (c) 2020 Sahkai Stowe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const category = require('./src/category.js')
const checks = require('./src/checks.js')
const context = require('./src/context.js')
const command = require('./src/command.js')
const embed = require('./src/embed.js')
const utils = require('./src/utils.js')
const bot = require('./src/bot.js')
const errors = require("./src/errors.js")
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
Hibiscus.Bot = bot
Hibiscus.CommandContext = context
Hibiscus.Category = category
Hibiscus.Checks = checks
Hibiscus.Command = command
Hibiscus.Utils = utils
Hibiscus.Embed = embed
Hibiscus.Errors = errors
Hibiscus.whenMentioned = whenMentioned
Hibiscus.whenMentionedOr = whenMentionedOr
Hibiscus.VERSION = version
module.exports = Hibiscus

