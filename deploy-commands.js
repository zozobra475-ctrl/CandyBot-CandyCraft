// deploy-commands.js (Versión ESM)
import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Definir __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables necesarias
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ¡Asegúrate de que CLIENT_ID está en tu .env!
const GUILD_ID = '1400075086635208735'; // Remplaza con el ID de tu servidor de pruebas o principal

const commands = [];
// Carga los comandos desde la carpeta /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    
    // Importación dinámica
    import(filePath).then(commandModule => {
        const command = commandModule.default;
        if (command && 'data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] El comando en ${filePath} no está formateado correctamente.`);
        }
    }).catch(error => {
        console.error(`Error al importar el archivo ${filePath}:`, error);
    });
}

// Cuando todos los comandos se han cargado (usamos un timeout simple para esperar)
setTimeout(async () => {
    // Construye y prepara la instancia de REST
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log(`Iniciando el despliegue de ${commands.length} comandos de aplicación (/).`);

        // === Despliegue GLOBAL ===
        // Utiliza esta línea si quieres que los comandos funcionen en TODOS los servidores
        // const data = await rest.put(
        //     Routes.applicationCommands(CLIENT_ID),
        //     { body: commands },
        // );

        // === Despliegue ESPECÍFICO DE GUILD (Más rápido para pruebas) ===
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Despliegue exitoso de ${data.length} comandos de aplicación (/).`);
    } catch (error) {
        console.error(error);
    }
}, 5000); // Esperar 5 segundos para asegurar que todos los imports dinámicos terminaron

