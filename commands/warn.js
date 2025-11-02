// /commands/warn.js (Ajustado a la exportación con nombre 'addSanction')

import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { addSanction } from '../utils/moderation.js'; // CAMBIO CLAVE: Importa 'addSanction'

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aplica una advertencia (warn) a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El usuario que recibirá la advertencia.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('La razón de la advertencia.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers), // Solo staff puede usarlo

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
        }

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const moderatorId = interaction.user.id;
        const guildId = interaction.guildId; // Necesitas el guildId para la función addSanction, aunque tu versión de addSanction solo usa userId. Lo mantendremos simple por ahora.

        try {
            // Usa la función 'addSanction' y especifica el tipo: 'warn'
            const logs = addSanction(target.id, 'warn', moderatorId, reason); 
            
            // Comprobación simple: si devuelve logs, fue un éxito.
            if (logs) {
                const embed = new EmbedBuilder()
                    .setTitle('🚨 Advertencia Aplicada')
                    .setColor('#FF9900') // Naranja
                    .setDescription(`El usuario **${target.tag}** ha sido advertido.`)
                    .addFields(
                        { name: 'Razón', value: reason },
                        { name: 'Moderador', value: interaction.user.tag },
                        { name: 'Total de advertencias', value: `${logs.warnings.length}` } // Muestra el número de warnings
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                
                // Intenta notificar al usuario por mensaje directo
                await target.send(`Has recibido una advertencia en el servidor **${interaction.guild.name}** por la razón: ${reason}`).catch(() => console.log("No se pudo enviar DM."));

            } else {
                await interaction.reply({ content: 'Hubo un error al registrar la advertencia.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error al ejecutar el comando warn:', error);
            await interaction.reply({ content: 'Ocurrió un error inesperado al procesar la advertencia.', ephemeral: true });
        }
    },
};
