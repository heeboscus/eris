class CommandContext {
    constructor(message, bot, command, args, prefix) {
        this.message = message
        this.bot = bot
        this.command = command
        this.args = args
        this.prefix = prefix
        this.send = message.channel.createMessage.bind(message.channel)
        this.author = message.guildID ? message.channel.guild.members.find(m => message.author.id === m.id) : message.author
        this.typing =  message.channel.sendTyping.bind(message.channel)
        this.author.tag = `${message.author.username}#${message.author.discriminator}`
        this.channel = message.channel
        this.guild = message.guildID ? message.channel.guild : undefined
        this.guild ? this.guild.me = this.guild.members.find(m => bot.user.id === m.id) : {}
    }
}
module.exports = CommandContext