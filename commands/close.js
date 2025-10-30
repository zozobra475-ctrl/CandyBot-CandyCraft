// /commands/close.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Cierra el ticket actual y crea una transcripción.')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del cierre del ticket.')
                .setRequired(true))
        .setDefaultMemberPermissions(0), // Solo Staff

    async execute(interaction) {
        if (!interaction.channel.name.startsWith('🎫-') && !interaction.channel.name.startsWith('🔒')) {
            return interaction.reply({ content: 'Este comando solo puede usarse en un canal de ticket.', ephemeral: true });
        }
        if (!interaction.member.permissions.has('KickMembers')) { // Asegúrate de que solo Staff pueda cerrar
            return interaction.reply({ content: 'No tienes permiso para cerrar tickets.', ephemeral: true });
        }

        await interaction.reply({ content: 'Iniciando proceso de transcripción y cierre...' });

        // --- 1. TRANSCRIPCIÓN (Usando el Fetch de Mensajes) ---
        const messages = await interaction.channel.messages.fetch({ limit: 100 }); // Ajusta el límite si es necesario

        let transcriptContent = `--- TRANSCRIPCIÓN DE CANDYBOT TICKET ---\n`;
        transcriptContent += `Canal: ${interaction.channel.name}\n`;
        transcriptContent += `Cerrado por: ${interaction.user.tag}\n`;
        transcriptContent += `Razón: ${interaction.options.getString('razon')}\n`;
        transcriptContent += `Fecha: ${new Date().toLocaleString()}\n\n`;

        messages.reverse().forEach(msg => {
            if (!msg.author.bot) { // Ignorar mensajes del bot
                transcriptContent += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
            }
        });

        const logChannelId = '1384938380340625459'; // <<-- ¡REEMPLAZAR ESTO!
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            // Guardar el archivo temporalmente y subirlo
            const tempFileName = `transcript-${interaction.channel.id}.txt`;
            fs.writeFileSync(tempFileName, transcriptContent);

            await logChannel.send({
                content: `Ticket Cerrado: ${interaction.channel.name} por ${interaction.user.tag}. Razón: ${interaction.options.getString('razon')}`,
                files: [tempFileName]
            });
            fs.unlinkSync(tempFileName); // Eliminar el archivo temporal
        } else {
            console.error('ID de canal de logs no encontrado.');
        }
        
        // --- 2. ELIMINAR EL CANAL DE TICKET ---
        await interaction.channel.send(`¡Ticket cerrado! Este canal será eliminado en 10 segundos.`);
        setTimeout(() => {
            interaction.channel.delete().catch(e => console.error('No se pudo eliminar el ticket:', e));
        }, 10000);
    }
};
