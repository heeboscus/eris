const CommandContext = require('./context.js')
const 
nameRegex = new RegExp(".{2,32}$"),
tagRegex = new RegExp(".{2,32}#[0-9]{4}$"),
nickRegex = new RegExp(".{1,32}$"),
mentionRegex = new RegExp("<@!?[0-9]{15,21}>$"),
idRegex = new RegExp("([0-9]{15,21})$"),
channelMentionRegex = new RegExp("<#[0-9]{15,21}>$"),
channelNameRegex = new RegExp(".{1,32}$")


class Converter {
    /**
     * Takes member-like query and returns a guild member.
     * Checking goes in the following order: ID > Mention > User Tag > Nickname > Username
     * @param {CommandContext} ctx Command context, needed to get members and guilds.
     * @param {string} query
     */
    memberConverter(ctx, q) {
        if (!ctx.guild) throw new Error("No guild found in context.")
        if (q.match(idRegex)) return ctx.guild.members.find(m => q === m.id)
        if (q.match(mentionRegex)) return ctx.guild.members.find(m => Boolean(q.match(new RegExp(`<@!?${m.id}>$`))))
        if (q.match(tagRegex)) return ctx.guild.members.find(m => q === `${m.username}#${m.discriminator}`)
        if (q.match(nickRegex)) return ctx.guild.members.find(m => m.nick && q === m.nick)
        if (q.match(nameRegex)) return ctx.guild.members.find(m => q === m.username)
        return undefined
    }
    /**
     * Takes user-like query and returns a user in client cache.
     * Checking goes in the following order: ID > Mention > User Tag > Username
     * @param {CommandContext} ctx Command context, needed to get bot client.
     * @param {string} query
     */
    userConverter(ctx, q) {
        if (q.match(idRegex)) return ctx.bot.users.find(u => q === u.id)
        if (q.match(mentionRegex)) return ctx.bot.users.find(u => Boolean(q.match(new RegExp(`<@!?${u.id}>`))))
        if (q.match(tagRegex)) return ctx.bot.users.find(u => q === `${u.username}#${u.discriminator}`)
        if (q.match(nameRegex)) return ctx.bot.users.find(u => q === u.username)
        return undefined
    }
    /**
     * Takes channel-like query and returns a user in client cache.
     * Checking goes in the following order: ID > Mention > Name 
     * @param {CommandContext} ctx Command context, needed to get guild channels.
     * @param {string} query
     */
    channelConverter(ctx, q) {
        if (q.match(idRegex)) return ctx.guild.channels.find(c => q === c.id)
        if (q.match(channelMentionRegex)) return ctx.guild.channels.find(c => q === `<#${c.id}>`)
        if (q.match(channelNameRegex)) return ctx.guild.channels.find(c => q === c.name)
        return undefined
    }
}
module.exports = Converter