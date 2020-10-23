module.exports = {
    isOwner(ctx) {
        if (ctx.bot.commandOptions.ownerID) {
            if (ctx.bot.commandOptions.ownerID instanceof Array 
            || typeof ctx.bot.commandOptions.ownerID === "object") return ctx.bot.commandOptions.ownerID.includes(ctx.author.id)
            else return ctx.bot.commandOptions.ownerID === ctx.author.id
        }
        else return false
    }
}