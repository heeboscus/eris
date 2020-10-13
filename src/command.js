class command {
    constructor({ name, exec=undefined, description=undefined, args=undefined, aliases=undefined, hidden=undefined, checks=undefined, cooldown=undefined, guildOnly=undefined, path=undefined, category=undefined }) {
        this.name = name
        this.exec = exec
        this.description = description
        this.args = args
        this.aliases = aliases
        this.hidden = hidden
        this.checks = checks
        this.cooldown = cooldown
        this.guildOnly = guildOnly
        this.path = path
        this.category = category
        this.setExec = exec => {
            this.exec = exec  
            return this 
        }
        this.setAliases = aliases => {
            this.aliases = aliases
            return this
        }
        this.addCheck = check => {
            this.checks.push(check)
            return this
        }
        this.setCooldown = time => {
            this.cooldown = time
            return this
        }
        this.setArgs = args => {
            this.args = args
            return this
        }
    }
}

module.exports = command