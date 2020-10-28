import Eris from "eris"

declare namespace Hibiscus {
    // Avoid using the "Function" type.
    type F = (...args: any[]) => any

    interface ArgType {
        name: string
        type: "str" | "num" | "member" | "user"
        required?: boolean
        useRest?: boolean
    }

    export class Bot extends Eris.Client {
        options: Eris.ClientOptions
        commandOptions: {
            prefix: string | string[] | ((m: Eris.Message) => string | string[] | Function)
            usePrefixSpaces?: boolean
            ownerID?: string | string[]
        }
        commands: Map<string, Command>
        categories: Map<string, Category>
        cooldowns: Map<string, Map<string, number>>
        async processCommands(msg: Eris.Message)
        getHelp(ctx: CommandContext, command: Command): string
        loadCategory(category: Category)
        unloadCategory(name: string)
        reloadCategory(name: string)
        getCatgeory(name: string): Category
        addCommand(cmd: Command)
        removeCommand(cmd: Command)
        reloadCommand(cmd: Command)
        loadEvent(name: string, path: string)
        unloadEvent(name: string)
        defaultHelp: Command
    }

    export class Category {
        name: string
        commands: Command[]
        globalChecks?: F[]
        path?: string
        addCommand(command: Command): this
        setChecks(checks: F[]): this
        constructor(opts: {
            name: string
            commands?: Command[]
            globalChecks?: F[]
            path?: string
        })
    }

    interface CommandContext {
        message: Eris.Message
        bot: Bot
        command: Command
        args: {[s: string]: any}
        prefix: string
        send: Eris.TextChannel.send
        author: Eris.Member | Eris.User
        channel: Eris.TextChannel | Eris.PrivateChannel
        guild: Eris.Guild
    }

    interface IsOwnerCheck {
        (ctx: CommandContext): boolean
    }

    export type Checks = {
        isOwner: IsOwnerCheck
    }

    export class Command {
        name: string
        exec: F
        description?: string
        args?: ArgType
        aliases?: string[]
        hidden?: boolean
        checks: F[]
        guildOnly?: boolean
        cooldown?: number
        path?: string
        category?: string
        setExec(exec: Function): this
        setAliases(aliases: string): this
        addCheck(check: Function): this
        setCooldown(time: number): this
        setArgs(args: ArgType[]): this
        constructor(opts: {
            name: string
            exec?: F
            description?: string
            args: ArgType[]
            aliases?: string[]
            hidden?: boolean
            checks?: F[]
            cooldown?: number
            guildOnly?: boolean
            path?: string
            category?: string
        })
    }

    export interface Utils {
        duration(date1: number, date2: number): string
    }

    export class Embed {
        set<K extends keyof Eris.EmbedOptions>(key: K, value: Eris.EmbedOptions[K]): this
        setTitle(title: string): this
        setDescription(description: string): this
        setURL(url: string): this
        setColor(color: number): this
        setTimestamp(timestamp: number | string): this
        setFooter(text: string, icon_url?: string): this
        setThumbnail(url: string)
        setImage(url: string)
        setAuthor(name: string, url?: string, icon_url?: string)
        addField(...args: Eris.EmbedField[]): this
        readonly data: {
            embed: Eris.EmbedOptions
        }
        constructor(opts?: Eris.EmbedOptions)
    }

    export function whenMentioned(): string[]
    export function whenMentionedOr(basePrefix: any): typeof whenMentioned

    export const VERSION: string

}

export = Hibiscus
