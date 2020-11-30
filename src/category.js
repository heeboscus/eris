const { Command, Group } = require("./command.js")
/**
 * Hibiscus Command Category Object.
 */
class Category {
    /**
     * Creates a category object.
     * @param {object} opts 
     * @param {string} opts.name
     * @param {(Command|Group)[]} opts.commands
     * @param {import("./command.js").checkExec[]} opts.globalChecks
     * @param {string} opts.path
     */
    constructor(opts) {
        const { name, commands, globalChecks, path } = opts
        if (!opts) throw new Error("Category requires an object.")
        if (!name || !name.length) throw new Error("Category is missing a name.")
        
        /**
         * Name of Category.
         * @type {string}
         */
        this.name = name
        /**
         * Commands and/or groups in category.
         * @type {(Command|Group)[]}
         */
        this.commands = commands || []
        /**
         * All checks for any command execution within category.
         * @type {import("./command.js").checkExec}
         */
        this.globalChecks = globalChecks || []
        /**
         * Path this category originates from.
         * @type {string}
         */
        this.path = path
    }
    /**
     * Adds a command to category commands.
     * @param {Command|Group} command 
     */
    addCommand(command) {
        let c = command
        c.category = this.name
        this.commands.push(c)
        return this
    }
    /**
     * Sets the global checks for the category.
     * @param {import("./command.js").checkExec[]} checks 
     */
    setChecks(checks) {
        this.globalChecks = checks
        return this
    }
}

module.exports = Category
