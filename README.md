# 🌺 ***Hibiscus*** 

### Command Handler for [Eris](https://abal.moe/eris 'Created by abalabahaha#9503')

```js
const hibiscus = require("@skullbite/hibiscus")

const bot = new hibiscus.Bot('token', {}, {prefix: "!"})

bot.addCommand(
    new hibiscus.Command({name: "greet"})
    .setExec(async function(ctx) {
        ctx.send(`Hi ${ctx.author.username}`)
    })
)

bot.connect()
```