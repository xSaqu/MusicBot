const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exit")
        .setDescription("Wyjście z kanału."),
    execute: async ({client, interaction}) => {

        const queue = client.player.getQueue(interaction.guild);

        if (!queue) {
            await interaction.reply("Obecnie żadna piosenka nie leci.");
            return;
        }

        queue.destroy();

        await interaction.reply("Papatki!")
    }
}