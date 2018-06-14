const Discord = require("discord.js");
const request = require("request");
const cydia = require("cydia-api-node");
const client = new Discord.Client();
const config = require("./config.json");

client.on("message", async message => {
    if (!((message.content.includes("[") || message.content.includes("]")))) return;
    if (message.content.match(/(?<=\[\[)(.*)(?=\]\])/g)) {
        let args = message.content.trim().match(/(?<=\[\[)(.*)(?=\]\])/g);
        const tweak = await cydia.getAllInfo(args[0]);
        if (!tweak) {
            return message.reply("package not found.");
        }
        const embed = new Discord.MessageEmbed()
            .setTimestamp()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setTitle("Tweak Information")
            .setFooter(`requested by ${message.author.tag}`, message.author.displayAvatarURL())
            .addField("Display Name", tweak.display, true)
            .addField("Package Name", tweak.name, true)
            .addBlankField()
            .addField("Latest Version", tweak.version, true)
            .addField("Section", tweak.section, true)
            .addBlankField()
            .addField("Price", tweak.price ? `$${tweak.price}` : "Free", true)
            .addField("Repository", `[${tweak.repo.name}](${tweak.repo.link})`, true);
        message.channel.send(embed);
        return;
    }
    let args = message.content.trim().match(/(?<=\[)(.*)(?=\))/g);
    for (let i = 0; i < args.length; i++) {
        args[i] = args[i].split(/\]\(/g)
    }
    args = args[0];
    const tweak = args[0];
    const link = args[1];
    if (!link.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        ))
        return message.reply("invalid URL.");
    request.get(
        `https://cydia.s0n1c.org/cydia/?url=${link}&q=${tweak}`,
        (err, resp, body) => {
            body = JSON.parse(body)
            if (err) return;
            if (!body.status) {
                return message.reply("package not found.");
            }
            const tweak = Object.values(body.results)[0];
            const embed = new Discord.MessageEmbed()
                .setTimestamp()
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setTitle("Tweak Information")
                .setThumbnail(tweak.depict)
                .setFooter(`requested by ${message.author.tag}`, message.author.displayAvatarURL())
                .addField("Display Name", tweak.name, true)
                .addField("Package Name", tweak.id, true)
                .addBlankField()
                .addField("Latest Version", tweak.version, true)
                .addField("Section", tweak.section, true)
                .addBlankField()
                .addField("Price", tweak.price ? `$${tweak.price}` : "Free (most likely)", true)
                .addField("Download", `[Link](${tweak.filename})`, true);
            message.channel.send(embed);
            //.addField("Price", tweak.price)
            // temp disabled .addField("Description", tweak.desc)
        }
    );
});

client.login(config.token);