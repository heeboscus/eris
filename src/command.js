/**
 * Hibiscus Command Object.
 */
class Command {
    /**
     * Creates a command object.
     * @param {{name: string, exec?: Function, description?: string, args: {name: string, type: ("str"|"num"), required?: boolean, useRest?: boolean}[], aliases?: string[], hidden?: boolean, checks?: Function[], cooldown?: number, guildOnly?: boolean, path?: string, category?: string}} opts Command options.
     */
    constructor(opts) {
        const { name, exec, description, args, aliases, hidden, checks, cooldown, guildOnly, path, category } = opts
        if (!opts) throw new Error("Command requires an object.")
        if (!opts.name || !opts.name.length) throw new Error("Command is missing a name.")
        /**
         * The name of the command.
         * @type {string} 
         */
        this.name = name
        /**
         * The code execute when the command is ran.
         * @type {Function}
         */
        this.exec = exec
        /**
         * The description for the command. Preferably what it does.
         * @type {string}
         */
        this.description = description
        /**
         * The arguments the user needs to put in.
         * @type {{name: string, type: ("str"|"num"), required?: boolean, useRest?: boolean}[]}
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
         * @type {Function[]}
         */
        this.checks = checks || []
        /**
         * The amount of time until the command can be run again. This number must be in milliseconds.
         * @type {number}
         */
        this.cooldown = cooldown
        /**
         * If this command can only be ran inside a guild.
         * @type {boolean}
         */
        this.guildOnly = guildOnly || false
        /**
         * The path where this command came from. If this file is isolated from category or the client, use `__filename`.
         * @type {string}
         */
        this.path = path
        /**
         * The category this command emerged from. 
         * @type {string}
         */
        this.category = category

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
     * @param {{name: string, type: ("str"|"num"), required?: boolean, useRest?: boolean}[]} args 
     */
    setArgs(args) {
        this.args = args
        return this
    }
}

module.exports = Command