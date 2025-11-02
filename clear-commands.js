import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = '1400075086635208735'; // tu ID de servidor

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🧹 Borrando comandos anteriores...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    console.log('✅ Todos los comandos de este servidor fueron eliminados.');
  } catch (error) {
    console.error('❌ Error al borrar los comandos:', error);
  }
})();
