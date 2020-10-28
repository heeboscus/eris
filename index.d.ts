import Eris from "eris";

declare namespace Hibiscus {
    export const VERSION: string

    interface Command {
        name: string,
        exec: Function,
        description?: string,
        args?: {
           name: string, 
           type: "str"|"num"|"member"|"user", 
           required?: boolean, 
           useRest?: boolean
        }[],
        aliases?: string[],
        hidden?: boolean,
        checks: Function[],
        guildOnly?: boolean,
        cooldown?: number,
        path?: string,
        category?: string,
        setExec(exec: Function): this,
        setAliases(aliases: string): this,
        addCheck(check: Function): this,
        setCooldown(time: number): this,
        setArgs(args: {name: string, type: "str"|"num"|"member"|"user", required?: boolean, useRest?: boolean}[]): this
    }

    interface Category {
        name: string,
        commands: Command[],
        globalChecks?: Function[],
        path?: string,
        addCommand(command: Command): this,
        setChecks(checks: Function[]): this
    }

    interface CommandContext {
        message: Eris.Message
        bot: Bot
        command: Command
        args: any,
        prefix: string,
        send: Eris.TextChannel.send,
        author: Eris.Member|Eris.User
        channel: Eris.TextChannel|Eris.PrivateChannel,
        guild: Eris.Guild
    }

    interface Bot extends Eris.Client {
        options: Eris.ClientOptions,
        commandOptions: {
            prefix: string|string[]|((m: Eris.Message) => string|string[]|Function), 
            usePrefixSpaces?: boolean, 
            ownerID?: string|string[]
        },
        commands: Map<string, Command>,
        categories: Map<string, Category>,
        cooldowns: Map<string, Map<string, number>>,
        async processCommands(msg: Eris.Message),
        getHelp(ctx: CommandContext, command: Command): string,
        loadCategory(category: Category),
        unloadCategory(name: string),
        reloadCategory(name: string),
        getCatgeory(name: string): Category,
        addCommand(cmd: Command), 
        removeCommand(cmd: Command),
        reloadCommand(cmd: Command),
        loadEvent(name: string, path: string),
        unloadEvent(name: string),
        defaultHelp: Command
    }
}