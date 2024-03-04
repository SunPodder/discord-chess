const {REST, Routes} = require("discord.js");
const {clientId, guildId, token} = require("./config");
const fs = require("node:fs")

const commands = [];
const commandFiles =
    fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.toJSON());
}

// rest endpoint
const rest = new REST({version: "10"}).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then((data) => console.log(
        `Successfully registered ${data.length} application commands.`))
    .catch(console.error);
