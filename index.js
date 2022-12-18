const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, GatewayIntentBits, Collection, } = require("discord.js");
const { Player } = require("discord-player");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        // ...
    ]
});

// Load all the commands
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    console.log("Loading command file:", filePath);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command);
}

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    
    const rest = new REST({version: "9"}).setToken(process.env.TOKEN);
    for (const guildId of guild_ids)
    {
        rest.put(Routes.applicationGuildCommand(process.env.CLIENT_ID, guildId), {
            body: commands
        })
    .then(() => console.log(`Added commands to ${guildId}`))
    .catch(console.error);
    }

});

client.on("interactionCreate", async interaction => {
    console.log("Interaction received:", interaction);
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    console.log("Command found:", command);
    if(!command) return;

    try
    {
        await command.execute({client, interaction});
    }
    catch(err)
    {
        console.error(err);
        await interaction.reply("An error occurred while executing that command.");
    }
});

client.login(process.env.TOKEN);