import {
    SlashCommandBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ChannelType
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Sistema de tickets para CandyCraft Network")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(sub =>
            sub
                .setName("setup")
                .setDescription("Configura el panel de tickets en el canal seleccionado")
                .addChannelOption(opt =>
                    opt
                        .setName("canal")
                        .setDescription("Canal donde se publicará el panel de tickets")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        console.log(`✅ Comando /ticket ejecutado por ${interaction.user.tag}`);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "🚫 No tienes permisos de administrador para usar este comando.",
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "setup") {
            const channel = interaction.options.getChannel("canal");

            if (!channel || channel.type !== ChannelType.GuildText) {
                return interaction.reply({
                    content: "❌ Por favor, selecciona un canal de texto válido.",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🎫 Sistema de Tickets - CandyCraft Network")
                .setColor("#FF69B4")
                .setDescription(
                    "¡Bienvenido/a al soporte de **CandyCraft Network**!\n\n" +
                    "📨 **Para abrir un ticket:**\n" +
                    "1️⃣ Haz clic en el botón de abajo.\n" +
                    "2️⃣ Selecciona la categoría de tu solicitud (reporte, ayuda, compras).\n\n" +
                    "🧁 Un miembro del equipo de staff te atenderá pronto."
                )
                .setFooter({ text: "CandyBot | Soporte 24/7" })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId("open_ticket")
                .setLabel("Abrir Ticket")
                .setStyle(ButtonStyle.Success)
                .setEmoji("📩");

            const row = new ActionRowBuilder().addComponents(button);

            try {
                await channel.send({ embeds: [embed], components: [row] });
                await interaction.reply({
                    content: `✅ Panel de tickets configurado correctamente en ${channel}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error("❌ Error al enviar el panel de tickets:", error);
                await interaction.reply({
                    content:
                        "⚠️ No pude enviar el mensaje. Asegúrate de que tengo permisos de **Enviar mensajes** en ese canal.",
                    ephemeral: true
                });
            }
        }
    }
};
