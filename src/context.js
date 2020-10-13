class context {
    constructor(message, bot, command, args, prefix) {
        this.message = message
        this.bot = bot
        this.command = command
        this.args = args
        this.prefix = prefix
        this.send = message.channel.createMessage.bind(message.channel)
        this.author = message.author
        this.channel = message.channel
        this.guild = message.guildID ? bot.getRESTGuild(message.guildID) : undefined
    }
}

module.exports = context