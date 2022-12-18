const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pauza")
        .setDescription("Zatrzymuję obecną piosenkę."),
    execute: async ({client, interaction}) => {

        const queue = client.player.getQueue(interaction.guild);

        if (!queue) {
            await interaction.reply("Obecnie żadna piosenka nie leci.");
            return;
        }

        const currentSong = queue.current;

        queue.setPaused(true);

        await interaction.reply("Zatrzymano obecną piosenkę")
    }
}