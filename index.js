const Discord = require("discord.js");
const request = require("request");
const cydia = require("cydia-api-node");
const client = new Discord.Client();
const config = require("./config.json");

client.on("message", async message => {
    if (!((message.content.includes("[") || message.content.includes("]")))) return;
    if (message.content.match(/(?<=\[\[)(.*)(?=\]\])/g)) { //wow i actually managed to make a regex
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
    } else if (message.content.match(/(?<=\(\()(.*)(?=\)\))/g)) {
        let link = message.content.trim().match(/(?<=\(\()(.*)(?=\)\))/g)[0];
        if (!link.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
            return message.reply("invalid URL.");
        }
        request.get(`https://cydia.s0n1c.org/cydia/?url=${link}`, (err, resp, body) => { //TODO: test this
            body = JSON.parse(body);
            if (!body.status) return message.reply("unable to find specified repository.");
            const embed = new Discord.MessageEmbed()
                .setTimestamp()
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setTitle("Repository Information")
                .setFooter(`requested by ${message.author.tag}`, message.author.displayAvatarURL())
                .addField("Label", body.info.Label, true)
                .addField("Suite", body.info.Suite, true)
                .addBlankField()
                .addField("Version", `${body.info.Version}, ${body.info.Codename}`, true)
                .addField("Description", body.info.Description, true)
                .addBlankField()
                .addField("Package Count", body.info.package_count, true)
                .addField(`Sections (${body.section_count})`, `${body.sections.map(e => `${e}\n`)}`, true);
            message.channel.send(embed);
        });
        return;
    }
    let args = message.content.trim().match(/(?<=\[)(.*)(?=\))/g);
    for (let i = 0; i < args.length; i++) {
        args[i] = args[i].split(/\]\(/g) //this is still a bit sloppy but it works well enough for now
    }
    args = args[0]; //preparing for multi package compatability
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
