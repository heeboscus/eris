const Eris = require("eris")
const context = require("./context.js")
const command = require("./command.js")

/**
* Hibiscus Client
* @extends {Eris.Client}
* @property {String|Array|((m: Eris.Client) => String|Array|Function)} [prefix] Prefix to listen for
* @property {Map} [commands] Map of all stored bot commands 
* @property {Map} [categories] Map of all command categories
* @property {Map} [cooldowns] Map of all commands with cooldowns
* @property {Function} [processCommands] Processes commands based on a command object.
*/
class Bot extends Eris.Client {
    /**
     * Create a Hibiscus Client
     * @arg {string} [token] Bot Token
     * @arg {Eris.ClientOptions} [options] Eris Client Options
     * @arg {Object} [commandOptions] Hibiscus Client Options
     * @arg {String|Array|((m: Eris.Client) => String|Array|Function)} [commandOptions.prefix] Prefix to listen for
     * @arg {Boolean} [commandOptions.usePrefixSpaces=false] Wether or not to check for spaces when processing commands
     */
    constructor(token, options, commandOptions) {
        options.restMode = true // need this regardless.
        super(token, options)
        this.prefix = commandOptions.prefix
        if (!this.prefix || this.prefix === [] || this.prefix === "") throw new Error("Empty Prefix Caught.")
        this.commands = new Map()
        this.categories = new Map()
        this.cooldowns = new Map()
        this.processCommands = async (msg) => {
            if (msg.author.bot) return
            let prefix, re
            switch(typeof this.prefix) {
                case 'string': 
                    re = `(${this.prefix})`
                    break
                case 'object':
                    re = `${this.prefix.map(e => e.replace(/ /g, "\\s?").replace(/\?/g, "\?")).join("|")}`
                    break
                case 'function':
                    let pre = await this.prefix.bind(this)(this, msg)
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
                            throw new Error(`Prefix function output must be string or object. Not ${typeof pre}.`)
                    }

            }
            let prefixArray = msg.content.match(new RegExp(`(${re})${commandOptions.usePrefixSpaces ? '\\s*?' : ''}`, "i"))
            if (!prefixArray) return
            prefix = prefixArray[0]
            if (!prefix) return
            let args = msg.content.slice(prefix.length).split(' ')
            const name = args.shift().toLowerCase()
            let command = this.getCommand(name)
            if (!command || command.length === 0) return
            const cmd = command instanceof Array ? command[0] : command
            const timer = Number(new Date())
            let ctx = new context(msg, this, cmd, {}, prefix)
            const checkArgs = () => {
                try {
                    if (!cmd.args) return {}
                    const properArgs = {}
                    let requiredArgs = new Array(cmd.args).reduce((a, c) => a + c.required ? 1 : 0, 0)
                    if(args.length < requiredArgs) throw new Error("") 
                    if(args.length > cmd.args.length && !cmd.args[cmd.args.length - 1].useRest) throw new Error("") 
                    for (let i = 0; i < cmd.args.length; i++) {
                        let argg
                        let argument = cmd.args[i]
                        if (argument.useRest) {
                            argg = args.slice(i).join(" ")
                            properArgs[argument.name] = argg
                            break
                        }
                        if (argument.type === "string") argg = String(args[i])
                        else if (argument.type === "number") argg = Number(args[i])
                        else if (argument.type === "member") {
                            if (!ctx.guild) throw new Error("Cannot retrieve member. No guild.")
                            this.searchGuildMembers(msg.guildID, String(argg[i]), 1).then(m => {
                            try {argg = m[0]}
                            catch {throw new Error('No Member Found')}
                        })}
                        else {
                            if (argument.default && !argument.required) argg = argument.default
                            else throw new Error("Missing default argument")
                        }
                    
                        if (Number.isNaN(argg) || argg === "" || argg === "undefined") throw new Error()
                        properArgs[argument.name] = argg
                    }
                    ctx.args = properArgs
                }
                
                catch (e) {
                    let err = {...Object.getOwnPropertyDescriptors(e), type: "INVALIDARGS"}
                    console.error(e)
                    return this.emit("commandError", ctx, err)
                }
                
            }
            checkArgs()
            if (cmd.guildOnly && !msg.guildID) {
                let err = {...Object.getOwnPropertyDescriptors(new Error("Guild only command missing guild.")), type: "NOGUILD"}
                return this.emit("commandError", ctx, err)
            }
            if (cmd.category) {
                const checks = this.getCategory(cmd.category).globalChecks
                if (checks) {
                    for (let check of checks) {
                        try {
                            if (!check.exec(msg)) throw check.error
                        }
                        catch (e) {
                            let err = {...Object.getOwnPropertyDescriptors(new Error("Invalid Arguments")), type: "CHECKFAILURE"}
                            return this.emit("commandError", ctx, err)
                        }
                    }
                }
            }
            if (cmd.checks && Boolean(cmd.checks.length)) {
                for (let check of cmd.checks) {
                    try {
                        if (!check.exec(msg)) throw check.error
                    }
                    catch(e) {
                        let err = {...Object.getOwnPropertyDescriptors(new Error("Invalid Arguments")), type: "CHECKFAILURE"}
                        console.error(e)
                        return this.emit("commandError", ctx, err)
                    } 
                }
            }
            try {
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
                    setTimeout(() => times.delete(msg.author.id), cmd.cooldown * 1000)
                }
                await cmd.exec.bind(this)(ctx).then(() => {
                    this.emit("commandExecute", ctx, timer)
                })
                
            }
            catch(e) {
                let err = {...Object.getOwnPropertyDescriptors(e), type: "EXECUTIONERROR"}
                console.error(e)
                this.emit("commandError", ctx, err)
            }
        }
        this.getHelp = (ctx, command=undefined) => {
            let usageStr, argList = new Array(), cmd
            cmd = command ? command : ctx.command
            cmd = command instanceof Array ? cmd[0] : cmd
            usageStr = cmd.aliases ? ctx.prefix + `[${cmd.name}|${cmd.aliases.join('|')}]` : usageStr = ctx.prefix + cmd.name
            if (!cmd.args) return usageStr
            cmd.args.map(a => {
                a.required ? argList.push(`<${a.name}>`) : argList.push(`[${a.name}${a.default ? `=${a.default}` : ""}]`)
            })
            return usageStr+" "+argList.join(' ')
        }
        this.loadCategory = (category) => {
            category.commands.map(cmd => this.addCommand(cmd))
            this.categories.set(category.name, category)
        }
        this.unloadCategory = (name) => {
            const category = this.getCategory(name)
            if (!category) return
            category.commands.map(a => {
                this.removeCommand(a)
            })
            this.categories.delete(name)
            if (category.path) delete require.cache[require.resolve(category.path)]
        }
        this.reloadCategory = (name) => {
            let cat = this.getCategory(name)
            this.unloadCategory(name)
            if (!cat.path) throw new Error("No path to reload from.")
            this.loadCategory(require(cat.path))
        }
        this.getCategory = name => this.categories.get(name)
        this.addCommand = cmd => { 
            let check = this.getCommand(cmd.name)
            if (!(check instanceof Array && check.length === 0)) throw new Error("Command name/alias has already been registed")
            if (cmd.name.length <= 0) throw new Error("Empty command name found")
            this.commands.set(cmd.name, cmd)
            if (cmd.cooldown) this.cooldowns.set(cmd.name, new Map())
        }
        this.removeCommand = cmd => {
            this.commands.delete(cmd.name)
            if (cmd.category || !cmd.path) return 
            delete require.cache[require.resolve(cmd.path)]
        }
        this.reloadCommand = command => {
            this.removeCommand(command)
            try {
                this.addCommand(command.name, command)
            }
            catch(e) {
                this.commands.set(command.name, command)
                throw e
            }
        }
        this.getCommand = q => this.commands.get(q) || Array.from(this.commands.values()).filter((command) => command.aliases && command.aliases.includes(q))
        this.loadEvent = async path => {
            const event = require(path)
            if (!event) throw new Error("No event found.") 
            this.on(name, event.bind(this))
        }
        this.unloadEvent = name => {
            this.on(name, ()=>{})
            // delete require.cache[require.resolve()]
        }
        this.defaultHelp = new command({name: "help"}) 
        .setArgs([{name: "cm", type: "string"}])
        .setExec(async function(ctx) { 
            let cats
            if (!ctx.args.cm) {
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
                return ctx.send(`\`🌺\` Command Help | \`${cmd.name}\`\n> Description: ${cmd.description ? cmd.description : "No Description."}\n> Usage: *\`${this.getHelp(ctx, cmd)}\`*${cmd.cooldown ? `\n> Cooldown: ${cmd.cooldown}s` : ""}`)
            }
        })
        
        this.once("shardPreReady", () => {
            this.preReady = true
            if (this.getCommand("help").length === 0) this.addCommand(this.defaultHelp)
            try {
                this.prefix.length === 0 || this.prefix.length === 1 ? this.prefix = this.prefix.bind(this)() : {}
            }
            catch {}
        })
        this.on("messageCreate", async (m) => await this.processCommands(m))
        
    }
}

module.exports = Bot