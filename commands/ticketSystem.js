import {
    SlashCommandBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistema de tickets para CandyCraft Network.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(sub =>
            sub
                .setName('setup')
                .setDescription('Configura el panel de tickets.')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal donde se enviará el panel.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({
                content: '❌ No tienes permisos para usar este comando.',
                ephemeral: true,
            });

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const canal = interaction.options.getChannel('canal');
            if (!canal || canal.type !== 0)
                return interaction.reply({
                    content: 'Por favor selecciona un canal de texto válido.',
                    ephemeral: true,
                });

            // 📋 Embed principal
            const embed = new EmbedBuilder()
                .setColor('#ffb347')
                .setTitle('🎟️ **CandyCraft Tickets**')
                .setThumbnail('https://i.imgur.com/6M4h8Jm.png') // Puedes poner tu logo
                .setDescription(
                    `> Es importante que hagas un **uso correcto** tanto de los tickets como de las categorías disponibles.\n\n` +
                    `Si el staff no responde en un plazo de **12–24 horas**, puede volver a abrir un ticket si el anterior fue cerrado.\n\n` +
                    `**Categorías disponibles:**\n\n` +
                    `🟢 **Soporte General** — Te ayudamos con cualquier duda o problema.\n` +
                    `🧑‍💼 **Reporte Usuario** — Reporta conductas indebidas de otros jugadores.\n` +
                    `🐞 **Reporte Bug** — Informa errores o fallos dentro del servidor.\n` +
                    `⚖️ **Apelaciones** — Apela tu baneo si crees que fue un error.\n` +
                    `🛍️ **Soporte Tienda** — Problemas con compras o pagos.\n` +
                    `🚨 **Reporte Staff** — Denuncia conductas sospechosas de un miembro del staff.\n\n` +
                    `🕒 *El tiempo promedio de respuesta es de 12–24 horas.*`
                )
                .setFooter({ text: 'CandyCraft Network | Sistema de soporte 24/7' })
                .setTimestamp();

            // 🎛️ Botones de categorías
            const fila1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_soporte')
                    .setLabel('Soporte General')
                    .setEmoji('🟢')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('ticket_reporte')
                    .setLabel('Reporte Usuario')
                    .setEmoji('🧑‍💼')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('ticket_bug')
                    .setLabel('Reporte Bug')
                    .setEmoji('🐞')
                    .setStyle(ButtonStyle.Secondary)
            );

            const fila2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_apelacion')
                    .setLabel('Apelaciones')
                    .setEmoji('⚖️')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('ticket_tienda')
                    .setLabel('Soporte Tienda')
                    .setEmoji('🛍️')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('ticket_staff')
                    .setLabel('Reporte Staff')
                    .setEmoji('🚨')
                    .setStyle(ButtonStyle.Danger)
            );

            try {
                await canal.send({ embeds: [embed], components: [fila1, fila2] });
                await interaction.reply({
                    content: `✅ Panel de tickets enviado correctamente a ${canal}.`,
                    ephemeral: true,
                });
            } catch (err) {
                console.error('Error al enviar el panel:', err);
                await interaction.reply({
                    content: '❌ Error al enviar el panel. Verifica los permisos del bot.',
                    ephemeral: true,
                });
            }
        }
    },
};
