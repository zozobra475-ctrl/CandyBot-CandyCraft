// SISTEMA DE TICKETS - CandyBot
import {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
} from "discord.js";

export function setupTickets(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // Comando /ticket-setup
    if (interaction.commandName === "ticket-setup") {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Soporte de CandyCraft")
        .setDescription("Haz clic en el botón de abajo para abrir un ticket con el staff 🍬")
        .setColor("Aqua");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("Abrir Ticket 🎟️")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }

    // Botón para crear ticket
    if (interaction.customId === "create_ticket") {
      const existing = interaction.guild.channels.cache.find(
        (c) => c.name === `ticket-${interaction.user.id}`
      );

      if (existing) {
        return interaction.reply({
          content: "❌ Ya tienes un ticket abierto.",
          ephemeral: true,
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
        ],
      });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Cerrar Ticket ❌")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎟️ ¡Hola ${interaction.user}, el equipo de soporte estará contigo pronto!`,
        components: [closeButton],
      });

      await interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true,
      });
    }

    // Botón para cerrar ticket
    if (interaction.customId === "close_ticket") {
      const channel = interaction.channel;
      await interaction.reply({
        content: "🕓 Cerrando el ticket en 5 segundos...",
        ephemeral: true,
      });
      setTimeout(() => channel.delete().catch(() => {}), 5000);
    }
  });
}