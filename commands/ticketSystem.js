import { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
    // Define el comando principal /ticket y el subcomando setup
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Comandos para la gestión del sistema de tickets.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Solo administradores
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Establece el panel de tickets en el canal actual.')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('El canal donde se publicará el panel de tickets.')
                        .setRequired(true))
        ),

    async execute(interaction) {
        // Solo permitir el comando a administradores
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'No tienes permisos de administrador para usar este comando.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canal');

            if (!channel || channel.type !== 0) { // 0 es el tipo TEXT
                return interaction.reply({ content: 'Por favor, selecciona un canal de texto válido.', ephemeral: true });
            }

            // --- Creación del Panel de Tickets ---
            const embed = new EmbedBuilder()
                .setTitle('🎫 Sistema de Tickets - CandyCraft Network')
                .setColor('#FF69B4') // Rosa Candy
                .setDescription('¡Bienvenido/a al soporte de CandyCraft Network!\n\n**Para abrir un ticket:**\n1. Haz clic en el botón de abajo.\n2. Selecciona la categoría de tu solicitud (reporte, ayuda, compras).\n\nUn miembro del equipo de staff te atenderá pronto.')
                .setTimestamp()
                .setFooter({ text: 'CandyBot | Soporte 24/7' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_ticket') // ID único para el evento interactionCreate
                        .setLabel('Abrir Ticket')
                        .setStyle(ButtonStyle.Success) // Verde
                        .setEmoji('📩'),
                );

            // Envía el mensaje y el botón al canal seleccionado
            try {
                await channel.send({
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content: `Panel de tickets configurado exitosamente en ${channel}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error al enviar el panel de tickets:', error);
                await interaction.reply({
                    content: 'Error al enviar el mensaje. Asegúrate de que el bot tiene permisos de "Enviar mensajes" en ese canal.',
                    ephemeral: true
                });
            }
        }
    }
};
