import {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType
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
            .setDescription('Canal donde se enviará el panel de tickets.')
            .setRequired(true)
        )
    ),
  console.log("✅ Comando /ticket ejecutado por:", interaction.user.tag);
  async execute(interaction) {
    try {
      // Defer Reply: evita el error "la aplicación no ha respondido"
      await interaction.deferReply({ ephemeral: true });

      const subcommand = interaction.options.getSubcommand();
      if (subcommand !== 'setup') return;

      const canal = interaction.options.getChannel('canal');

      // Verifica tipo de canal
      if (canal.type !== ChannelType.GuildText) {
        return interaction.editReply({
          content: '❌ Por favor selecciona un canal de texto válido.',
        });
      }

      // --- EMBED PRINCIPAL ---
      const embed = new EmbedBuilder()
        .setColor('#ffb347')
        .setTitle('🎟️ CandyCraft Tickets')
        .setThumbnail('https://i.imgur.com/6M4h8Jm.png') // Cambia a tu logo
        .setDescription(
          `> Bienvenido/a al **Sistema de Tickets de CandyCraft Network**.\n\n` +
            `Por favor, selecciona la categoría que corresponda a tu situación:\n\n` +
            `🟢 **Soporte General** — Dudas o asistencia técnica.\n` +
            `🧑‍💼 **Reporte Usuario** — Conductas indebidas.\n` +
            `🐞 **Reporte Bug** — Errores o fallos del servidor.\n` +
            `⚖️ **Apelaciones** — Apela tu sanción si fue injusta.\n` +
            `🛍️ **Soporte Tienda** — Problemas con compras o pagos.\n` +
            `🚨 **Reporte Staff** — Reporta a un miembro del staff.\n\n` +
            `🕒 *Tiempo promedio de respuesta: 12–24 horas.*`
        )
        .setFooter({ text: 'CandyCraft Network | Soporte 24/7' })
        .setTimestamp();

      // --- BOTONES ---
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

      // --- ENVÍO DEL PANEL ---
      await canal.send({ embeds: [embed], components: [fila1, fila2] });

      await interaction.editReply({
        content: `✅ Panel de tickets configurado correctamente en ${canal}.`,
      });
    } catch (err) {
      console.error('❌ Error en ticket setup:', err);
      if (!interaction.replied)
        await interaction.reply({
          content: '⚠️ Ocurrió un error al configurar el panel. Revisa la consola.',
          ephemeral: true,
        });
    }
  },
};
