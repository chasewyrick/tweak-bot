const Discord = require("discord.js");
const request = require("request");
const client = new Discord.Client();
const config = require("./config.json");

client.on("message", message => {
    if (!((message.content.includes("[") || message.content.includes("]"))) || !(message.content.includes("(") || message.content.includes(")"))) return;
    const args = message.content
        .trim()
        .split("[")
        .join("")
        .split("]");
    args[1] = args[1].replace("(", "").replace(")", "");
    const tweak = args[0];
    const link = args[1];
    if (!link.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        ))
        return;
    console.log(link, tweak);
    request.get(
        `https://cydia.s0n1c.org/cydia/?url=${link}&q=${tweak}`,
        (err, resp, body) => {
            body = JSON.parse(body)
            if (err) return;
            console.log(body.status);
            if (!body.status) {
                return message.reply("package not found.");
            }
            const tweak = Object.keys(body.results)[0];
            const embed = new Discord.MessageEmbed()
                .setTimestamp()
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setTitle("Tweak Information")
                .addField("Display Name", tweak.name, true)
                .addField("Package Name", tweak.id, true)
                .addField("Description", tweak)
        }
    );
});

client.login(config.token);