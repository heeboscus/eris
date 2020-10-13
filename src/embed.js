class embed {
    constructor({ title, description, author, url, color, timestamp, fields}) {
        this.data = {
            embed: {
                title: title,
                description: description,
                author: author,
                url: url,
                color: color,
                timestamp: timestamp,
                fields: []
            }
        }
        this.set = (key, value) => {
            this.data.embed[key] = value
            return this
        }
        this.setTitle = (title) => {
            this.data.embed.title = title
            return this
        }
        this.setDescription = (description) => {
            this.data.embed.description = description
            return this
        }
        this.setURL = (url) => {
            this.data.embed.url = url
            return this
        }
        this.setColor = (color) => {
            this.data.embed.color = color
            return this
        }
        this.setTimestamp = (timestamp) => {
            this.data.embed.timestamp = timestamp
            return this
        }
        this.setFooter = (text, icon_url=undefined) => {
            this.data.embed.footer = {text: text, icon_url: icon_url}
            return this
        }
        this.setThumbnail = (url) => {
            this.data.embed.thumbnail = {url: url}
            return this
        }
        this.setImage = (url) => {
            this.data.embed.image = {url: url}
            return this
        }
        this.setAuthor = (name, url=undefined, icon_url=undefined) => {
            this.data.embed.author = {name: name, url: url, icon_url: icon_url}
            return this
        }
        this.addField = (name, value, inline=false) => {
            this.data.embed.fields.push({name: name, value: value, inline: inline ? inline : false})
            return this
        }
        this.toJSON = () => this.data
    }
}

module.exports = embed