const CommandContext = require("./context.js")
/**
 * Hibiscus Command Object.
 * @typedef exec
 * @type {Function}
 * @typedef argument
 * @type {object} 
 * @property {string} argument.name
 * @property {"str" | "num" | "member" | "user"} args.type
 * @property {?boolean} args.required
 * @property {?boolean} args.useRest
 * @typedef checkExec
 * @type {Function}
 */
class Command {
    /**
     * Creates a command object.
     * @param {object} opts Command options.
     * @param {string} opts.name
     * @param {?exec} opts.exec 
     * @param {?string} opts.description
     * @param {?argument[]} opts.args
     * @param {?string[]} opts.aliases
     * @param {?boolean} opts.hidden
     * @param {?checkExec[]} opts.checks
     * @param {?number} opts.cooldown
     * @param {?boolean} opts.guildOnly
     * @param {?string} opts.path
     * @param {?string} opts.category
     * @param {?string} opts.parent
     */
    constructor(opts) {
        const { name, exec, description, args, aliases, hidden, checks, cooldown, guildOnly, path, category, parent } = opts
        if (!opts) throw new Error("Command requires an object.")
        if (!opts.name || !opts.name.length) throw new Error("Command is missing a name.")
        /**
         * The name of the command.
         * @type {string} 
         */
        this.name = name
        /**
         * The code to execute when the command is ran.
         * @type {exec}
         */
        this.exec = exec
        /**
         * The description for the command. Preferably what it does.
         * @type {string}
         */
        this.description = description
        /**
         * Sets the arguments for the command.
         * @type {argument[]} 
         */
        this.args = args
        /**
         * An array of alternate command names. Be cautious of overlapping other command names/aliases.
         * @type {string[]}
         */
        this.aliases = aliases || []
        /**
         * If the command should be shown in the default help.
         * @type {boolean}
         */
        this.hidden = hidden || false
        /**
         * Functions to run before executing the command.
         * @type {checkExec[]}
         */
        this.checks = checks || []
        /**
         * The amount of time until the command can be run again. The time is counted in milliseconds.
         * @type {number}
         */
        this.cooldown = cooldown
        /**
         * If this command can only be ran inside a guild.
         * @type {boolean}
         */
        this.guildOnly = guildOnly || false
        /**
         * The path where this command came from. If this file is isolated from a category or the client, use `__filename`.
         * @type {string}
         */
        this.path = path
        /**
         * The category this command emerged from. 
         * @type {string}
         */
        this.category = category
        /**
         * The parent of a subcommand.
         * @type {string}
         */
        this.parent = parent
    }
    /**
     * Sets the function to run when the command is called.
     * @param {Function} exec The function to set. Only argument needed is `ctx`.
     */
    setExec(exec) {
        this.exec = exec  
        return this 
    }
    /**
     * Sets a list of other names to run the command by. Be cautious of overlapping other command names/aliases.
     * @param {string[]} aliases The array of aliases to be set.
     */
    setAliases(aliases) {
        this.aliases = aliases
        return this
    }
    /**
     * Adds a check function to the array to be ran before command invocation.
     * @param {Function} check The check function to be added. Only argument needed is `ctx`. Must return bool-like resposne.
     */
    addCheck(check) {
        this.checks.push(check)
        return this
    }
    /**
     * Adds a cooldown per user.
     * @param {number} time The amount of time until the command can be run again. This number must be in milliseconds.
     */
    setCooldown(time) {
        this.cooldown = time
        return this
    }
    /**
     * Sets the arguments for the command.
     * @param {argument[]} args
     */
    setArgs(args) {
        this.args = args
        return this
    }
    /**
     * Sets the required bot permissions for executing a command.
     * @param {string[]} permissions 
     */
    botPerms(permissions) {
        this.neededBotPerms = permissions
        return this
    }
    /**
     * Sets the required user permissions for executing a command.
     * @param {string[]} permissions 
     */
    memberPerms(permissions) {
        this.neededMemberPerms = permissions
        return this
    }
}

/**
 * Hibiscus Command Group Object.
 */
class Group extends Command {
    /**
     * Creates a command object.
     * @param {object} opts Command options.
     * @param {string} opts.name
     * @param {?exec} opts.exec 
     * @param {?string} opts.description
     * @param {?argument[]} opts.args
     * @param {?string[]} opts.aliases
     * @param {?boolean} opts.hidden
     * @param {?checkExec[]} opts.checks
     * @param {?number} opts.cooldown
     * @param {?boolean} opts.guildOnly
     * @param {?string} opts.path
     * @param {?string} opts.category
     * @param {?string} opts.parent
     */
    constructor(opts) {
        super(opts)
        /**
         * Group of subcommands.
         * @type {Map<string, Command>}
         */
        this.subcommands = new Map()
        /**
         * Group of subcommand cooldowns.
         * @todo move subcommand cooldowns to other to base cooldowns.
         * @type {Map<string, Map<string, number>>}
         */
        this.subCooldowns = new Map()
    }
    /**
     * Gets a subcommand from the group.
     * @param {string} q 
     * @returns {Command}
     */
    getSubcommand(q) { 
        let cmd = this.subcommands.get(q) || Array.from(this.subcommands.values()).filter((command) => command.aliases && command.aliases.includes(q)) 
        return cmd instanceof Array ? cmd[0] : cmd
    }
    /**
     * Adds a subcommand
     * @param {Command} cmd 
     */
    addSubcommand(cmd) {
        let check = this.getSubcommand(cmd.name)
        if (check) throw new Error(`${this.name}: Subcommand name/alias has already been registed.`)
        if (!cmd.exec) throw new Error(`${this.name}: Subcommand is missing \"exec\" function.`)
        if (cmd.aliases) {
            if (new Set(cmd.aliases).size !== cmd.aliases.length) throw new Error(`${this.name}: Subcommand aliases already registered.`)
        }
        this.subcommands.set(cmd.name, cmd)
        if (cmd.cooldown) this.subCooldowns.set(cmd.name, new Map())
        cmd.parent = this.name
        return this
    }
}
module.exports = { Command, Group }