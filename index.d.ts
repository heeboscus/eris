import * as Eris from "eris"

declare namespace Hibiscus {
    type F = (...args: any[]) => any
    export function commandExec(this: Bot, ctx: CommandContext): Promise<any>
    export function checkExec(this: Bot, ctx: CommandContext): Boolean
    class ExecutionError extends Error {
        original: Error
    }
    interface CmdOpts {
        prefix: string | string[] | ((m: Eris.Message) => string | string[] | Function)
        usePrefixSpaces?: boolean
        ownerID?: string | string[]
    }
    interface PaginatorOptions {
        pages: (object|string)[]
        type: "reaction" | "message"
        timeout: number
        authorOnly: boolean
    }
    
    interface ArgType {
        name: string
        type: "str" | "num" | "member" | "user"
        required?: boolean
        useRest?: boolean
    }
    
    
    interface HibiscusEvents<T> extends Eris.ClientEvents<T> {
        (event: "commandError", listener: (ctx: CommandContext, error: Error) => void): T
        (event: "afterCommandExecute", listener: (ctx: CommandContext, timer: Date) => void): T
        (event: "beforeCommandExecute" | "commandExecute", listener: (ctx: CommandContext) => void): T
        (event: "commandCooldown", listener: (ctx: CommandContext, left: number) => void): T
    }
    
    export class ExtGuild extends Eris.Guild {
        me: Eris.Member
    }
    export class ExtMember extends Eris.Member {
        tag: string
    }
    export class ExtUser extends Eris.User {
        tag: string
    }

    export class Bot extends Eris.Client {
        constructor(token: string, options: Eris.ClientOptions, hibiscusOptions: CmdOpts)
        commandOptions: CmdOpts
        commands: Map<string, Command>
        categories: Map<string, Category>
        cooldowns: Map<string, Map<string, number>>
        processCommands(msg: Eris.Message): Promise<void>
        getHelp(ctx: CommandContext, command?: Command): string
        loadCategory(category: Category)
        paginator(ctx: CommandContext, options: PaginatorOptions)
        unloadCategory(name: string)
        reloadCategory(name: string)
        getCatgeory(name: string): Category
        addCommand(cmd: Command|Group)
        removeCommand(cmd: string)
        reloadCommand(cmd: string)
        getCommand(q: string): Command
        loadEvent(name: string, path: string)
        unloadEvent(name: string)
        on: HibiscusEvents<this>
        defaultHelp: Command
    }

    export class Category {
        name: string
        commands: Command[]
        globalChecks?: typeof checkExec[]
        path?: string
        addCommand(command: Command): this
        setChecks(checks: typeof checkExec[]): this
        constructor(opts: {
            name: string
            commands?: Command[]
            globalChecks?: typeof checkExec[]
            path?: string
        })
    }

    interface CommandContext {
        message: Eris.Message
        bot: Bot
        command: Command
        args: {[s: string]: any}
        prefix: string
        typing: Eris.Textable["sendTyping"]
        send: Eris.Textable["createMessage"]
        author: ExtMember | ExtUser
        channel: Eris.TextChannel
        guild: ExtGuild
    }

    export class Command {
        name: string
        exec: typeof commandExec
        description?: string
        args?: ArgType
        aliases?: string[]
        hidden?: boolean
        checks: typeof checkExec[]
        guildOnly?: boolean
        cooldown?: number
        path?: string
        category?: string
        setExec(exec: typeof commandExec): this
        setAliases(aliases: string[]): this
        addCheck(check: typeof checkExec): this
        setCooldown(time: number): this
        setArgs(args: ArgType[]): this
        botPerms(permissions: string[]): this
        memberPerms(permissions: string[]): this
        constructor(opts: {
            name: string
            exec?: typeof commandExec
            description?: string
            args?: ArgType[]
            aliases?: string[]
            hidden?: boolean
            checks?: typeof checkExec[]
            cooldown?: number
            guildOnly?: boolean
            path?: string
            category?: string
            parent?: string
        })
    }
    
    export class Group extends Command {
        subcommands: Map<string, Command>
        subCooldowns: Map<string, Map<string, number>>
        addSubcommand(cmd: Command): this
        getSubcommand(q: string): Command
        constructor(opts: {
            name: string
            exec?: typeof commandExec
            description?: string
            args?: ArgType[]
            aliases?: string[]
            hidden?: boolean
            checks?: typeof checkExec[]
            cooldown?: number
            guildOnly?: boolean
            path?: string
            category?: string
        })
    }

    export const Errors: {
        NoPrivate: typeof Error
        MissingBotPerms: typeof Error
        MissingMemberPerms: typeof Error
        CheckFailure: typeof Error
        MissingArguments: typeof Error
        InvalidArguments: typeof Error
        ExecutionError: typeof ExecutionError
    }

    export class Embed {
        set<K extends keyof Eris.EmbedOptions>(key: K, value: Eris.EmbedOptions[K]): this
        setTitle(title: string): this
        setDescription(description: string): this
        setURL(url: string): this
        setColor(color: number): this
        setTimestamp(timestamp: number | string): this
        setFooter(text: string, icon_url?: string): this
        setThumbnail(url: string): this
        setImage(url: string): this
        setAuthor(name: string, url?: string, icon_url?: string): this
        addField(name: string, value: string, inline?: boolean): this
        toJSON(): Embed["data"]
        readonly data: {
            embed: Eris.EmbedOptions
        }
        constructor(opts?: Eris.EmbedOptions)
    }

    export function whenMentioned(): string|string[]
    export function whenMentionedOr(basePrefix: string|string[]): typeof whenMentioned
    export const VERSION: string
    export const Utils: { duration(date1: number, date2: number): string }
    export const Checks: { isOwner: typeof checkExec }
}

export = Hibiscus
