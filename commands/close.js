// /commands/close.js (Versión ESM corregida)
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // CAMBIO 1
import fs from 'fs'; // CAMBIO 1
import path from 'path';

export default { // CAMBIO 2
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Cierra el ticket actual y crea una transcripción.')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del cierre del ticket.')
                .setRequired(true))
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        if (!interaction.channel.name.startsWith('🎫-') && !interaction.channel.name.startsWith('🔒')) {
            return interaction.reply({ content: 'Este comando solo puede usarse en un canal de ticket.', ephemeral: true });
        }
        if (!interaction.member.permissions.has('KickMembers')) { 
            return interaction.reply({ content: 'No tienes permiso para cerrar tickets.', ephemeral: true });
        }

        await interaction.reply({ content: 'Iniciando proceso de transcripción y cierre...' });

        // --- TRANSCRIPCIÓN ---
        const messages = await interaction.channel.messages.fetch({ limit: 100 }); 

        let transcriptContent = `--- TRANSCRIPCIÓN DE CANDYBOT TICKET ---\n`;
        transcriptContent += `Canal: ${interaction.channel.name}\n`;
        transcriptContent += `Cerrado por: ${interaction.user.tag}\n`;
        transcriptContent += `Razón: ${interaction.options.getString('razon')}\n`;
        transcriptContent += `Fecha: ${new Date().toLocaleString()}\n\n`;

        messages.reverse().forEach(msg => {
            if (!msg.author.bot) { 
                transcriptContent += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
            }
        });

        const logChannelId = '1433466662178258944'; 
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const tempFileName = path.join(process.cwd(), `transcript-${interaction.channel.id}.txt`);
            fs.writeFileSync(tempFileName, transcriptContent);

            await logChannel.send({
                content: `Ticket Cerrado: ${interaction.channel.name} por ${interaction.user.tag}. Razón: ${interaction.options.getString('razon')}`,
                files: [tempFileName]
            });
            fs.unlinkSync(tempFileName); 
        } else {
            console.error('ID de canal de logs no encontrado. Verifica la variable logChannelId.');
        }
        
        // --- ELIMINAR EL CANAL DE TICKET ---
        await interaction.channel.send(`¡Ticket cerrado! Este canal será eliminado en 10 segundos.`);
        setTimeout(() => {
            interaction.channel.delete().catch(e => console.error('No se pudo eliminar el ticket:', e));
        }, 10000);
    }
};
