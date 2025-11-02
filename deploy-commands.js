// deploy-commands.js (Versión ESM - CORREGIDA para asegurar la carga ASÍNCRONA)

import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Definir __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables necesarias (Usando los IDs que proporcionaste)
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 
const GUILD_ID = '1400075086635208735'; // Tu ID de servidor

if (!TOKEN || !CLIENT_ID) {
    console.error("ERROR: Asegúrate de que TOKEN y CLIENT_ID están definidos en el archivo .env");
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Array de promesas para esperar todas las importaciones
const importPromises = commandFiles.map(file => {
    const filePath = path.join(commandsPath, file);
    
    // Importación dinámica y manejo de errores
    return import(filePath)
        .then(commandModule => {
            const command = commandModule.default;
            if (command && 'data' in command && 'execute' in command) {
                return command.data.toJSON();
            } else {
                console.log(`[WARNING] El comando en ${filePath} no está formateado correctamente o no tiene exportación default.`);
                return null; // Devuelve null si está mal formateado
            }
        })
        .catch(error => {
            console.error(`Error al importar el archivo ${filePath}:`, error);
            return null; // Devuelve null en caso de error
        });
});

// Función principal asíncrona para ejecutar el despliegue
async function deployCommands() {
    // 1. Esperar a que TODAS las promesas de importación se resuelvan
    const results = await Promise.all(importPromises);
    
    // 2. Filtrar los comandos válidos
    const validCommands = results.filter(command => command !== null);

    if (validCommands.length === 0) {
        console.log("No se encontraron comandos válidos para desplegar.");
        return;
    }

    // 3. Construye y prepara la instancia de REST
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log(`Iniciando el despliegue de ${validCommands.length} comandos de aplicación (/).`);

        // === Despliegue ESPECÍFICO DE GUILD ===
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: validCommands },
        );

        console.log(`✅ Despliegue exitoso de ${data.length} comandos de aplicación (/).`);
        console.log("Puedes usar tus comandos en Discord ahora.");

    } catch (error) {
        console.error("ERROR CRÍTICO AL DESPLEGAR LOS COMANDOS:", error);
    }
}

deployCommands(); // Ejecuta la función principal
