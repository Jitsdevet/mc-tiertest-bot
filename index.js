require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    SlashCommandBuilder,
    REST,
    Routes
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName("result")
        .setDescription("Post a Spain styled test result")

        // 👨‍⚖️ User option
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Select Discord user")
                .setRequired(true)
        )

        // 👤 Tested player option
        .addUserOption(option =>
            option
                .setName("tested_player")
                .setDescription("Select tested player")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("minecraft_user")
                .setDescription("Minecraft username")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Gamemode")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("region")
                .setDescription("Region")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("previous_rank")
                .setDescription("Previous rank")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("earned_rank")
                .setDescription("Earned rank")
                .setRequired(true)
        )

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {

        console.log("🔄 Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ Slash command loaded.");

    } catch (err) {
        console.log(err);
    }
})();

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "result") return;

    // 👮 Tester role check
    if (
        !interaction.member.roles.cache.has(
            process.env.TESTER_ROLE_ID
        )
    ) {
        return interaction.reply({
            content: "❌ You are not allowed.",
            ephemeral: true
        });
    }

    const user = interaction.options.getUser("user");
    const testedPlayer = interaction.options.getUser("tested_player");

    const minecraftUser =
        interaction.options.getString("minecraft_user");

    const gamemode =
        interaction.options.getString("gamemode");

    const region =
        interaction.options.getString("region");

    const previousRank =
        interaction.options.getString("previous_rank");

    const earnedRank =
        interaction.options.getString("earned_rank");

    const resultChannel =
        interaction.guild.channels.cache.get(
            process.env.RESULT_CHANNEL_ID
        );

    // 🎮 Minecraft skin
    const skin =
        `https://mc-heads.net/body/${minecraftUser}/right`;

    const embed = new EmbedBuilder()

        .setColor("#c60b1e")

        .setAuthor({
            name:
                `🇪🇸 ${testedPlayer.username}'s Spain Test Results`,
            iconURL:
                testedPlayer.displayAvatarURL()
        })

        .setDescription(
`## 🏆 Resultado Oficial

👨‍⚖️ **Tester**
${interaction.user}

👤 **Tested Player**
${testedPlayer}

🌍 **Region**
${region}

⛏️ **Minecraft Username**
${minecraftUser}

🎮 **Gamemode**
${gamemode}

📉 **Previous Rank**
${previousRank}

📈 **Earned Rank**
${earnedRank}

🇪🇸 Viva España`
        )

        .setThumbnail(skin)

        .setFooter({
            text:
                "Spain Ranking System 🇪🇸"
        })

        .setTimestamp();

    // 👇 Mentions boven embed
    await resultChannel.send({
        content:
            `👤 Tested Player: ${testedPlayer}\n👨‍⚖️ Tester: ${interaction.user}`,
        embeds: [embed]
    });

    await interaction.reply({
        content: "✅ Result posted.",
        ephemeral: true
    });

});

client.login(process.env.TOKEN);