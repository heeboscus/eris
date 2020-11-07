const Eris = require("eris")
const CommandContext = require("./context.js")
const Command = require("./command.js")
const Converter = require("./converter.js")
const Errors = require("./errors")
const { MessageCollector, ReactionCollector } = require("eris-collector")
const errors = require("./errors")

/**
* Hibiscus Client.
* @extends {Eris.Client} Credit for the original client goes to abalabahaha#9503 on discord.
* @property {Eris.ClientOptions} options Eris Client Options.
* @property {object} commandOptions Hibiscus Client Options.
* @property {string|string[]|((m: Eris.Message) => string|string[]|Function)} commandOptions.prefix The prefix to use when looking for commands. Can be a string, an array of strings or a function returning a string or an array of strings.
* @property {boolean} commandOptions.usePrefixSpaces Run commands with or without spaces at the end of prefix if true.
* @property {string|boolean} commandOptions.ownerID User ID or array of user IDs that own this bot.
*/
class Bot extends Eris.Client {
    /**
     * Creates a Hibiscus Client.
     * @param {string} token Discord Bot Token.
     * @param {Eris.ClientOptions} options Eris Client Options.
     * @param {{prefix: string|string[]|((m: Eris.Message) => string|string[]|Function), usePrefixSpaces?: boolean, ownerID?: string}} commandOptions Hibiscus Client Options.
     */
    constructor(token, options, commandOptions) {
        super(token, options)
        if (!options) throw new Error("Hibiscus client is missing eris options.")
        options.restMode = true // need this regardless.
        if (!commandOptions) throw new Error("Hibiscus client is missing command options.")
        const { prefix, usePrefixSpaces, ownerID } = commandOptions
        /**
         * Hibiscus Client Options.
         * @type {{prefix: string|string[]|((m: Eris.Message) => string|string[]|Function), usePrefixSpaces?: boolean, ownerID?: string}}
         */
        this.commandOptions = {
            prefix: prefix,
            usePrefixSpaces: usePrefixSpaces || false,
            ownerID: ownerID || ''
        }
        if (!prefix || prefix === [] || prefix === "") throw new Error("Empty Prefix Caught.")
        // TODO: migrate to Eris.Collection
        this.commands = new Map()
        this.categories = new Map()
        this.cooldowns = new Map()
        this.once("shardPreReady", () => {
            this.preReady = true
            if (!this.getCommand("help").length) this.addCommand(this.defaultHelp)
            try {
                typeof this.commandOptions.prefix === "function" &&
                    (this.commandOptions.prefix.length === 0 || this.commandOptions.prefix.length === 1)
                    ? this.commandOptions.prefix = this.commandOptions.prefix.bind(this)() : {}
            }
            catch { }
        })
        this.on("messageCreate", async (m) => await this.processCommands(m))
    }
    async processCommands(msg) {
        if (msg.author.bot) return
        let prefix, re, p
        switch (typeof this.commandOptions.prefix) {
            case 'string':
                re = `(${this.commandOptions.prefix})`
                break
            case 'object':
                re = `${this.commandOptions.prefix.map(e => e.replace(/ /g, "\\s?").replace(/\?/g, "\?")).join("|")}`
                break
            case 'function':
                let pre = await this.commandOptions.prefix.bind(this)(this, msg)
                switch (typeof pre) {
                    case 'string':
                        re = `(${pre})`
                        break
                    case 'function':
                        p = pre.bind(this)()
                        re = `^(${typeof p === 'string' ? p : p.join('|')})`
                        break
                    case 'object':
                        re = `${pre.map(e => e.replace(/ /g, "\\s?").replace(/\?/g, "\?")).join('|')}`
                        break
                    default:
                        throw new Error(`Prefix function output must be string or object (array). Not ${typeof pre}.`)
                }
            default:
                throw new Error(`Prefix must be string, object (array) or function. Not ${typeof this.commandOptions.prefix}`)
        }
        let prefixArray = msg.content.match(new RegExp(`(${re})${this.commandOptions.usePrefixSpaces ? '\\s*?' : ''}`, "i"))
        if (!prefixArray) return
        prefix = prefixArray[0]
        if (!prefix) return
        let args = msg.content.slice(prefix.length).split(' ')
        const name = args.shift().toLowerCase()
        let command = this.getCommand(name)
        if (!command || command.length === 0) return
        const cmd = command instanceof Array ? command[0] : command
        let ctx = new CommandContext(msg, this, cmd, {}, prefix)
        if (cmd.guildOnly && !msg.guildID) {
            let err = new Errors.NoPrivate
            return this.emit("commandError", ctx, err)
        }
        if (cmd.neededBotPerms) {
            if (ctx.guild) {
                let missingBotPerms = []
                try {
                    for (let i = 0; i < cmd.neededBotPerms; i++) {
                        if (!ctx.guild.me.permission.has(cmd.neededBotPerms[i])) throw new Errors.MissingBotPerms
                    }
                }
                catch (e) {
                    return this.emit("commandError", ctx, e)
                }   
            }
        }
        if (cmd.neededMemberPerms) {
            if (ctx.guild) {
                let missingMemberPerms = []
                try {
                    for (let i = 0; i < cmd.neededMemberPerms; i++) {
                        if (!ctx.author.permission.has(cmd.neededUserPerms[i])) throw new Errors.MissingMemberPerms
                    }
                }
                catch (e) {
                    return this.emit("commandError", ctx, e)
                }
            }
        }
        if (cmd.category) {
            const checks = this.getCategory(cmd.category).globalChecks
            if (checks) {
                for (let check of checks) {
                    try {
                        if (!check) throw new TypeError(`Check must be a function. Not ${typeof check}.`)
                        let res
                        if (check.constructor.name === "AsyncFunction") res = await check(ctx)
                        else res = check(ctx)
                        if (!res) throw new Errors.CheckFailure(check.name)
                    }
                    catch (e) {
                        return this.emit("commandError", ctx, e)
                    }
                }
            }
        }
        if (cmd.checks.length) {
            for (let check of cmd.checks) {
                try {
                    if (!check) throw new TypeError(`Check must be a function. Not ${typeof check}.`)
                    let res
                    if (check.constructor.name === "AsyncFunction") res = await check(ctx)
                    else res = check(ctx)
                    if (!res) throw new Errors.CheckFailure(check.name)
                }
                catch (e) {
                    return this.emit("commandError", ctx, e)
                }
            }
        }
        const timer = Number(new Date())
        this.emit("beforeCommandExecute", ctx)
        let checkArgs = () => {
            if (!cmd.args) return {}
            const properArgs = {}
            let requiredArgs = new Array(cmd.args).reduce((a, c) => a + c.required ? 1 : 0, 0)
            if (args.length < requiredArgs) throw new Errors.MissingArguments
            if (args.length > cmd.args.length && !cmd.args[cmd.args.length - 1].useRest) throw new Errors.InvalidArguments
            for (let i = 0; i < cmd.args.length; i++) {
                let argg, argument = cmd.args[i], toUse = argument.useRest ? args.slice(i).join(" ") : args[i]
                switch (argument.type) {
                    case "str" || undefined:
                        argg = String(toUse)
                        break
                    case "num":
                        argg = Number(toUse)
                        break
                    case "member":
                        try { argg = Converter.prototype.memberConverter(ctx, toUse) }
                        catch { argg = undefined }
                        break
                    case "user":
                        try { argg = Converter.prototype.userConverter(ctx, toUse) }
                        catch { argg = undefined }
                        break
                    case "channel":
                        try { argg = Converter.prototype.channelConverter(ctx, toUse) }
                        catch { argg = undefined }
                        break
                }
                if (argument.required && (Number.isNaN(argg) || argg === "" || argg === "undefined" || ((argument.type === "member" || argument.type === "user") && !argg))) throw new Errors.InvalidArguments
                properArgs[argument.name] = argg
                if (argument.useRest) break
            }
            ctx.args = properArgs
        }
        try { checkArgs() }
        catch (e) {
            return this.emit("commandError", ctx, e)
        }
        if (cmd.cooldown) {
            let times = this.cooldowns.get(cmd.name)
            if (!times) {
                this.cooldowns.set(cmd.name, new Map())
                times = this.cooldowns.get(cmd.name)
            }
            const now = Number(new Date())
            if (times.has(msg.author.id)) {
                const expires = Number(times.get(msg.author.id)) + (cmd.cooldown * 1000)
                if (now < expires) {
                    const left = (expires - now) / 1000
                    return this.emit("commandCooldown", ctx, left)
                }
            }
            times.set(msg.author.id, new Date())
            setTimeout(() => times.delete(msg.author.id), cmd.cooldown)
        }
        this.emit("commandExecute", ctx)
        try {
            await cmd.exec.bind(this)(ctx).then(() => {
                this.emit("afterCommandExecute", ctx, timer)
            })
        }
        catch (e) {
            let err = new Errors.ExecutionError(e.message, e.stack)
            this.emit("commandError", ctx, err)
        }
    }
    async paginate(ctx, options=undefined) {
        let msg,
            // allSameType = (arr) => new Set(arr.map((x) => typeof x)).size <= 1,
            currentPage = 0,
            bot = (ID) => {
                let u = Converter.prototype.userConverter(ctx, ID)
                return u ? u.bot : false
            }
            filter,
            c
        let opts = {
            pages: options.pages ? options.pages : [],
            type: options.type ? options.type : "reaction",
            timeout: options.timeout ? options.timeout : 1000*40,
            authorOnly: options.authorOnly || !options.authorOnly ? options.authorOnly : true
        }
        /* TODO: Proper error handling for incorrect/unmatching types
        if (!allSameType(opts.pages.map(i => typeof i))) throw new errors.ExecutionError("Types in pages aren't matching. They can only be string or object types.")
        if (!opts.pages.map(i => typeof i).includes("string") || !opts.pages.map(i => typeof i).includes("object")) throw new errors.ExecutionError("Page types can only be string or object types.") */

        msg = await ctx.send(opts.pages[currentPage])
        if (opts.type === "reaction") {
            let emojiList = ["⏪", "◀", "⏹", "▶", "⏩"]
            if (ctx.guild) {
                if (ctx.guild.me.permission.has("addReactions")) emojiList.map(a => msg.addReaction(a))
                else throw new errors.MissingBotPerms("Cannot add reactions. Missing permissions.")
            }
            else {
                emojiList.map(a => msg.addReaction(a)) 
            }
            filter = (m, emoji, userID) => emojiList.includes(emoji.name) && opts.authorOnly ? userID === ctx.author.id : !bot(userID)
            c = new ReactionCollector(this, msg, filter, { time: opts.timeout })
            c.on("collect", (m, e, uID) => {
                switch (e.name) {
                    case "⏪":
                        currentPage = 0
                        msg.edit(opts.pages[currentPage])
                        break 
                    case "◀":
                        if (currentPage === 0) return
                        currentPage--
                        msg.edit(opts.pages[currentPage])
                        break
                    case "⏹":
                        try { msg.removeReactions() }
                        catch { msg.delete() }
                        c.stop()
                        break
                    case "▶":
                        if (currentPage === opts.pages.length - 1) return
                        currentPage++
                        msg.edit(opts.pages[currentPage])
                        break
                    case "⏩":
                        currentPage = opts.pages.length - 1
                        msg.edit(opts.pages[currentPage])
                        break
                    default: return 
                }
                try { msg.removeReaction(e.name, uID) }
                catch { }
            })
        }
        else if (opts.type === "message") {
            let textList = ["first", "previous", "stop", "next", "last"]
            let menu = await ctx.send(`**First** | **Previous** | **Stop** | **Next** | **Last**`)
            filter = (m) => textList.includes(m.content.toLowerCase()) && opts.authorOnly ? m.author.uID === ctx.author.id : !bot(userID)
            c = new MessageCollector(this, ctx.channel, filter, { time: opts.timeout })
            c.on("collect", m => {
                switch (m.content.toLowerCase()) {
                    case "first":
                        currentPage = 0
                        msg.edit(opts.pages[currentPage])
                        break 
                    case "previous":
                        if (currentPage === 0) return
                        currentPage--
                        msg.edit(opts.pages[currentPage])
                        break
                    case "stop":
                        currentPage--
                        c.stop()
                    case "next":
                        if (currentPage === opts.pages.length - 1) return
                        currentPage++
                        msg.edit(opts.pages[currentPage])
                        break
                    case "last":
                        currentPage = opts.pages.length - 1
                        msg.edit(opts.pages[currentPage])
                        break
                    default: return
                }
                try { m.delete() }
                catch { }
            })
            c.on("end", () => {
                menu.delete()
            })

        }
        else throw new errors.ExecutionError("Paginator type must be 'message' or 'reaction'.")

    } 
    getHelp(ctx, command = undefined) {
        let usageStr, argList = new Array(), cmd
        cmd = command ? command : ctx.command
        cmd = command instanceof Array ? cmd[0] : cmd
        usageStr = cmd.aliases.length ? ctx.prefix + `[${cmd.name}|${cmd.aliases.join('|')}]` : usageStr = ctx.prefix + cmd.name
        if (!cmd.args) return usageStr
        cmd.args.map(a => {
            a.required ? argList.push(`<${a.name}>`) : argList.push(`[${a.name}${a.default ? `=${a.default}` : ""}]`)
        })
        return usageStr + " " + argList.join(' ')
    }
    loadCategory(category) {
        if (this.getCategory(category.name)) throw new Error("Category name has already been registered.")
        category.commands.map(cmd => this.addCommand(cmd))
        this.categories.set(category.name, category)
    }
    unloadCategory(name) {
        const category = this.getCategory(name)
        if (!category) return
        category.commands.map(a => {
            this.removeCommand(a.name)
        })
        this.categories.delete(name)
        if (category.path) delete require.cache[require.resolve(category.path)]
    }
    reloadCategory(name) {
        let cat = this.getCategory(name)
        this.unloadCategory(name)
        if (!cat.path) throw new Error("No path to reload from.")
        this.loadCategory(require(cat.path))
    }
    getCategory(name) { return this.categories.get(name) }
    addCommand(cmd) {
        let check = this.getCommand(cmd.name)
        if (!(check.length === 0)) {
            if (check.category) {
                this.unloadCategory(check.category)
            }
            throw new Error("Command name/alias has already been registed.")
        }
        if (!cmd.exec) throw new Error("Command is missing \"exec\" function.")
        if (cmd.aliases) {
            if (new Set(cmd.aliases).size !== cmd.aliases.length) throw new Error("Command aliases already registered.")
        }
        this.commands.set(cmd.name, cmd)
        if (cmd.cooldown) this.cooldowns.set(cmd.name, new Map())
    }
    removeCommand(name) {
        const cmd = this.getCommand(name)
        if (!cmd.length) return
        this.commands.delete(name)
        if (!cmd.category || !cmd.path) return
        delete require.cache[require.resolve(cmd.path)]
    }
    reloadCommand(name) {
        const tempCmd = this.getCommand(name)
        if (!tempCmd.length) throw new Error("No command found.")
        if (!tempCmd.path) throw new Error("No path to reload from.")
        this.removeCommand(tempCmd.name)
        
        try {
            this.addCommand(name, test)
        }
        catch (e) {
            this.commands.set(tempCmd.name, tempCmd)
            throw e
        }
    }
    getCommand(q) { return this.commands.get(q) || Array.from(this.commands.values()).filter((command) => command.aliases && command.aliases.includes(q)) }
    loadEvent(name, path) {
        const event = require(path)
        if (!event) throw new Error("No event found.")
        this.on(name, event.bind(this))
    }
    unloadEvent(name) {
        this.on(name, () => { })
        // delete require.cache[require.resolve()]
    }
    defaultHelp = new Command({ name: "help" })
        .setArgs([{ name: "cm", type: "str" }])
        .setExec(async function (ctx) {
            let cats
            if (!ctx.args.cm || ctx.args.cm === "undefined") {
                let non = Array.from(this.commands.values()).filter((command) => !command.category)
                cats = Array.from(this.categories.values()).map((x) => `> ${x.name} (${x.commands.length} Command${x.commands.length === 1 ? "" : 's'})`)
                if (non.length) cats.push(`> no-category (${non.length} Command${non.length === 1 ? "" : 's'})`)
                await ctx.send(`\`🌺\` Categories\n${cats.join('\n')}\n\n> Get command or category help with \`${ctx.prefix}help [command or module name]\``.replace(new RegExp(`<@!?${this.user.id}>`, "g"), `@${this.user.username}`))
            }
            else {
                let command = this.getCommand(ctx.args.cm)
                if (!command || command.length === 0) {
                    let category = this.getCategory(ctx.args.cm)
                    if (category) {
                        let cmds = category.commands.map(x => {
                            if (!x.hidden) return `> \`${x.name}\` - ${x.description ? x.description : "No Description."}`
                        })
                        if (!cmds.length) cmds.push("> No visible commands availible.")
                        return ctx.send(`\`🌺\` Category | ${category.name}\n${cmds.join('\n')}\n\n> Get command help with \`${ctx.prefix}help [command name]\``.replace(new RegExp(`<@!?${this.user.id}>`, "g"), `@${this.user.username}`))
                    }
                    if (ctx.args.cm === 'no-category') {
                        let cmds = Array.from(this.commands.values()).filter((command) => !command.category).map((x) => {
                            if (!x.hidden) return `> \`${x.name}\` - ${x.description ? x.description : "No Description."}`
                        })
                        if (!cmds.length) cmds.push("> No visible commands availible.")
                        return ctx.send(`\`🌺\` Category | no-category\n${cmds.join('\n')}\n\n> Get command help with \`${ctx.prefix}help [command name]\``.replace(new RegExp(`<@!?${this.user.id}>`, "g"), `@${this.user.username}`))
                    }
                    return ctx.send(`\`❌\` No command or category found.`)
                }
                const cmd = command instanceof Array ? command[0] : command
                return ctx.send(`\`🌺\` Command Help | \`${cmd.name}\`\n> Description: ${cmd.description ? cmd.description : "No Description."}\n> Usage: *\`${this.getHelp(ctx, cmd)}\`*${cmd.cooldown ? `\n> Cooldown: ${cmd.cooldown}ms` : ""}`)
            }
        })
}

module.exports = Bot
