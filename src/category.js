class category {
    constructor({ name, commands, globalChecks, path }) {
        this.name = name
        this.commands = commands || []
        this.globalChecks = globalChecks || []
        this.path = path
        this.addCommand = (command) => {
            let c = command
            c.category = name
            this.commands.push(c)
            return this
        }
        this.setChecks = (checks) => {
            this.globalChecks = checks
            return this
        }
    }
}

module.exports = category