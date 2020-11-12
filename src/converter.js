const CommandContext = require('./context.js')
const
    nameRegex = new RegExp(".{2,32}$"),
    tagRegex = new RegExp(".{2,32}#[0-9]{4}$"),
    nickRegex = new RegExp(".{1,32}$"),
    mentionRegex = new RegExp("<@!?[0-9]{15,21}>$"),
    idRegex = new RegExp("([0-9]{15,21})$"),
    channelMentionRegex = new RegExp("<#[0-9]{15,21}>$"),
    channelNameRegex = new RegExp(".{1,32}$"),
    emojiRegex = new RegExp("<a?:.+?:\d+>")


class Converter {
    /**
     * Takes member-like query and returns a guild member.
     * Checking goes in the following order: ID > Mention > User Tag > Nickname > Username
     * @param {CommandContext} ctx Command context, needed to get members and guilds.
     * @param {string} q
     */
    memberConverter(ctx, q) {
        let mem
        if (!ctx.guild) throw new Error("No guild found in context.")
        if (q.match(idRegex)) mem = ctx.guild.members.find(m => q === m.id)
        else if (q.match(mentionRegex)) mem = ctx.guild.members.find(m => Boolean(q.match(new RegExp(`<@!?${m.id}>$`))))
        else if (q.match(tagRegex)) mem = ctx.guild.members.find(m => q === `${m.username}#${m.discriminator}`)
        else if (q.match(nickRegex)) mem = ctx.guild.members.find(m => m.nick && q === m.nick)
        else if (q.match(nameRegex)) mem = ctx.guild.members.find(m => q === m.username)
        return mem
    }
    /**
     * Takes user-like query and returns a user in client cache.
     * Checking goes in the following order: ID > Mention > User Tag > Username
     * @param {CommandContext} ctx Command context, needed to get bot client.
     * @param {string} q
     */
    userConverter(ctx, q) {
        let user
        if (q.match(idRegex)) user = ctx.bot.users.find(u => q === u.id)
        else if (q.match(mentionRegex)) user = ctx.bot.users.find(u => Boolean(q.match(new RegExp(`<@!?${u.id}>`))))
        else if (q.match(tagRegex)) user = ctx.bot.users.find(u => q === `${u.username}#${u.discriminator}`)
        else if (q.match(nameRegex)) user = ctx.bot.users.find(u => q === u.username)
        return user
    }
    /**
     * Takes channel-like query and returns a user in client cache.
     * Checking goes in the following order: ID > Mention > Name 
     * @param {CommandContext} ctx Command context, needed to get guild channels.
     * @param {string} q
     */
    channelConverter(ctx, q) {
        if (!ctx.guild) throw new Error("No guild found in context.")
        if (q.match(idRegex)) return ctx.guild.channels.find(c => q === c.id)
        if (q.match(channelMentionRegex)) return ctx.guild.channels.find(c => q === `<#${c.id}>`)
        if (q.match(channelNameRegex)) return ctx.guild.channels.find(c => q === c.name)
        return undefined
    }
}
module.exports = Converter
