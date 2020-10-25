class Embed {
    constructor(opts=undefined) {
        if (!opts) opts = {}
        const { title, description, author, url, color, timestamp, fields } = opts
        this.data = {
            embed: {
                title: title,
                description: description,
                author: author,
                url: url,
                color: color,
                timestamp: timestamp,
                fields: fields
            }
        }
        this.toJSON = () => this.data
    }
    set(key, value) {
        this.data.embed[key] = value
        return this
    }
    setTitle(title) {
        this.data.embed.title = title
        return this
    }
    setDescription(description) {
        this.data.embed.description = description
        return this
    }
    setURL(url) {
        this.data.embed.url = url
        return this
    }
    setColor(color) {
        this.data.embed.color = color
        return this
    }
    setTimestamp(timestamp) {
        this.data.embed.timestamp = timestamp
        return this
    }
    setFooter(text, icon_url=undefined) {
        this.data.embed.footer = {text: text, icon_url: icon_url}
        return this
    }
    setThumbnail(url) {
        this.data.embed.thumbnail = {url: url}
        return this
    }
    setImage(url) {
        this.data.embed.image = {url: url}
        return this
    }
    setAuthor(name, url=undefined, icon_url=undefined) {
        this.data.embed.author = {name: name, url: url, icon_url: icon_url}
        return this
    }
    addField(name, value, inline=false) {
        this.data.embed.fields.push({name: name, value: value, inline: inline ? inline : false})
        return this
    }
}

module.exports = Embed