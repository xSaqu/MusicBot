const {SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Puszczam piosenkę.")
    .addSubcommand(subcommand => {
        subcommand
        .setName("szukaj")
        .setDescription("Szukam piosenki.")
        .addStringOption(option => {
            option
            .setName("słowakluczowe")
            .setDescription("Szukam słów kluczowych")
            .setRequired(true);
        })
    })
    .addSubcommand(subcommand => {
        subcommand
        .setName("playlista")
        .setDescription("Odtwarzam playlistę z YouTube")
        .addStringOption((option) => {
            option
              .setName("url")
              .setDescription("url playlisty")
              .setRequired(true);
          })
    })
    .addSubcommand(subcommand => {
        subcommand
        .setName("piosenka")
        .setDescription("Odtwarzam piosenkę z YouTube")
        .addStringOption(option => {
            option
            .setName("url")
            .setDescription("url piosenki")
            .setRequired(true)
        })
    }),
        execute: async ({client, interaction}) => {
        if (!interaction.member.voice.channel)
        {
            await interaction.reply("Musisz być na kanale głosowym by użyć tej komendy");
            return;
        }

        const queue = await client.player.createQueue(interaction.guild);

        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new MessageEmbed();
        if(interaction.option.getSubCommand() === "piosenka")
        {
            let url = interaction.option.getString("url");

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });
        

            if (result.tracks.lengh === 0)
            {
                await interaction.reply("Nic nie znaleziono");
                return
            }

            const song = result.tracks[0]
            await queue.addTrack(song);

            embed
                .setDescription(`Dodano **[${song.title}](${song.url})** do kolejki.`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Czas trwania: ${song.duration}`});

        }
        else if(interaction.option.getSubCommand() === "playlista")
        {
            let url = interaction.option.getString("url");

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });
        

            if (result.tracks.lengh === 0)
            {
                await interaction.reply("Nie znaleziono playlisty");
                return
            }

            const playlista = result.tracks[0]
            await queue.addTracks(playlista);

            embed
                .setDescription(`Dodano **[${playlista.title}](${playlista.url})** do kolejki.`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Czas trwania: ${playlista.duration},`});

        }
        else if(interaction.option.getSubCommand() === "słowakluczowe")
        {
            let url = interaction.option.getString("url");

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });
        

            if (result.tracks.lengh === 0)
            {
                await interaction.reply("Nic nie znaleziono");
                return
            }

            const song = result.tracks[0]
            await queue.addTracks(song);

            embed
                .setDescription(`Dodano **[${song.title}](${song.url})** do kolejki.`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Czas trwania: ${song.duration}`});
        }    

        if(!queue.playing) await queue.play();

        await interaction.reply({
            embeds: [embed]
        })
    }
}