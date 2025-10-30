// CANDYBOT - Discord.js v14 (Modular Refactor)
import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    EmbedBuilder // Mantener EmbedBuilder por si quieres usarlo en comandos legacy
} from "discord.js";
import { Player } from "discord-player";
import express from "express";
import fetch from "node-fetch"; // Necesario para el comando !players
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// === Mantener Railway activo ===
const app = express();
app.get("/", (req, res) => res.send("CandyBot está activo 24/7"));
app.listen(process.env.PORT || 3000, () => console.log("Servidor web activo."));

// === Configuración del bot ===
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // CRÍTICO: para AntiSpam y comandos legacy !
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
});

client.commands = new Collection();
client.cooldowns = new Collection(); // CRÍTICO: Para AntiSpam
const player = new Player(client);

// ------------------------------------------
// === 1. CARGA DE MÓDULOS (Comandos y Eventos) ===
// ------------------------------------------

// Carga de Comandos de Barra (/)
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    // Usamos require ya que estamos en un contexto de módulo híbrido (JS v14)
    const command = require(filePath); 
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[ADVERTENCIA] El comando ${filePath} no tiene las propiedades "data" o "execute" requeridas.`);
    }
}

// Carga de Eventos (AntiSpam, Tickets, Ready)
const eventsPath = path.join(process.cwd(), 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && file !== 'interactionCreate.js'); // Excluir interactionCreate por ahora
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Cargar interactionCreate.js por separado (para asegurarnos de que se carga correctamente)
const interactionCreate = require('./events/interactionCreate.js');
client.on(interactionCreate.name, (...args) => interactionCreate.execute(...args, client));


// ------------------------------------------
// === 2. LÓGICA LEGACY (Se pueden mantener estos comandos ! antiguos) ===
// ------------------------------------------
client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    const args = msg.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // !ping
    if (command === "!ping") {
        msg.reply(`🏓 Pong! Latencia: ${client.ws.ping}ms`);
    }

    // !help (Actualizado para reflejar comandos /)
    if (command === "!help") {
        const embed = new EmbedBuilder()
            .setTitle("📜 Comandos de CandyBot")
            .setColor("#ff66cc")
            .setDescription("Usamos **Slash Commands (/)** para moderación avanzada y tickets. Usa `/` en Discord.\nComandos Legacy disponibles:")
            .addFields(
                { name: "💬 Básicos", value: "`!ping`, `!help`" },
                { name: "🎮 Minecraft", value: "`!mcinfo`, `!players`" }
            );
        msg.channel.send({ embeds: [embed] });
    }

    // === Minecraft Integration ===
    if (command === "!mcinfo") {
        msg.reply("🎮 Servidor CandyCraft: play.candycraft.net\nVersión: 1.21");
    }

    if (command === "!players") {
        try {
            // Se usa la API de mcsrvstat.us
            const res = await fetch("https://api.mcsrvstat.us/2/play.candycraft.net");
            const data = await res.json();
            
            if (data.online) {
                msg.reply(`👥 Jugadores conectados: **${data.players.online}/${data.players.max}**`);
            } else {
                 msg.reply("⚠️ El servidor de Minecraft parece estar offline.");
            }
        } catch (err) {
            msg.reply("⚠️ No se pudo obtener información del servidor.");
        }
    }
});


// === Bienvenida ===
client.on("guildMemberAdd", (member) => {
    const channel = member.guild.systemChannel;
    if (channel) channel.send(`🎉 ¡Bienvenido/a ${member}! Disfruta de CandyCraft 🍬`);
});

// === Música ===
player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(`🎵 Reproduciendo: **${track.title}**`);
});


// ------------------------------------------
// === 3. LOGIN ===
// ------------------------------------------
client.once("ready", () => {
    console.log(`✅ CANDYBOT conectado como ${client.user.tag}`);
    // Opcional: Ejecutar deploy-commands.js automáticamente si es necesario
    // console.log("Desplegando comandos de barra..."); 
    // require('./deploy-commands'); 
});

// Nota: Cambié process.env.TOKEN a process.env.DISCORD_TOKEN o el nombre que uses
client.login(process.env.TOKEN);
