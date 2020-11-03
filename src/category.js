const Command = require("./command.js")
/**
 * Hibiscus Category Object.
 */
class Category {
    /**
     * @param {{name: string, commands: (Array), globalChecks?: Function[], path?: string}} opts Category options.
     * @NOTE When using `path` in options it should always be `__filename` (recommended), or the static file path for the category file.
     */
    constructor(opts) {
        const { name, commands, globalChecks, path } = opts
        if (!opts) throw new Error("Category requires an object.")
        if (!name || !name.length) throw new Error("Category is missing a name.")

        this.name = name
        this.commands = commands || []
        this.globalChecks = globalChecks || []
        this.path = path
    }
    /**
     * @param {Command} command Adds a command to the category.
     */
    addCommand(command) {
        let c = command
        c.category = this.name
        this.commands.push(c)
        return this
    }
    /**
     * @param {Function[]} checks Sets the checks for the category. This will run checks before running any command in the category.
     */
    setChecks(checks) {
        this.globalChecks = checks
        return this
    }
}

module.exports = Category
