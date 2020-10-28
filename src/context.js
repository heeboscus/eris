
const { Message, TextChannel: { prototype: { createMessage } }, User, Channel, Guild, Member } = require("eris")

const Bot = require("./bot.js")
const Command = require("./command.js")
/**
 * Hibiscus context object for command invocation. 
 */
class CommandContext {
    /**
     * Creates a command context object, manual creation not recommended.
     * @param {Message} message The message that invoked the command.
     * @param {Bot} bot The client which ran the command.
     * @param {Command} command Command that was invoked.
     * @param {{name: any}[]} args The arguments applied in the command.
     * @param {string} prefix The prefix used to invoke the command.
     */
    constructor(message, bot, command, args, prefix) {
        /**
         * The message that invoked the command.
         * @type {Message}
         */
        this.message = message
        /**
         * The bot object in the command.
         * @type {Bot}
         */
        this.bot = bot
        /**
         * Command that was invoked.
         * @type {Command}
         */
        this.command = command
        /**
         * The arguments applied in the command.
         */
        this.args = args
        /**
         * The prefix used to invoke the command.
         * @type {string}
         */
        this.prefix = prefix
        /**
         * Sends a message to the channel that the command was invoked in. Shorthand for `message.channel.createMessage`.
         * @type {createMessage} 
         */
        this.send = message.channel.createMessage.bind(message.channel)
        /**
         * The user that invoked the command.
         * @type {User|Member} 
         */
        this.author = message.guildID ? message.channel.guild.members.find(m => message.author.id === m.id) : message.author
        this.author.tag = `${message.author.username}#${message.author.discriminator}`
        /**
         * The channel that the command was invoked in.
         * @type {Channel}
         */
        this.channel = message.channel
        /**
         * The guild that the command was invoked in (if any).
         * @type {Guild}
         */
        this.guild = message.guildID ? message.channel.guild : undefined
        this.guild ? this.guild.me = this.guild.members.find(m => bot.user.id === m.id) : {}
    }
}

module.exports = CommandContext