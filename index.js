// CANDYBOT - Discord.js v14
if (process.env.RUN_DEPLOY === "true") {
  import("./deploy-commands.js");
}

import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder
} from "discord.js";
import { Player } from "discord-player";
import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { setupTickets } from "./ticketSystem.js";
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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
const player = new Player(client);

// === COMANDOS BÁSICOS ===
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // !ping
  if (command === "!ping") {
    msg.reply(`🏓 Pong! Latencia: ${client.ws.ping}ms`);
  }

  // !help
  if (command === "!help") {
    const embed = new EmbedBuilder()
      .setTitle("📜 Comandos de CandyBot")
      .setColor("#ff66cc")
      .setDescription("Lista de comandos disponibles:")
      .addFields(
        { name: "💬 Básicos", value: "`!ping`, `!help`" },
        { name: "🛠️ Moderación", value: "`!ban`, `!kick`, `!mute`, `!unmute`" },
        { name: "🎶 Música", value: "`!play <url>`, `!skip`, `!stop`" },
        { name: "🎮 Minecraft", value: "`!mcinfo`, `!players`" }
      );
    msg.channel.send({ embeds: [embed] });
  }

  // === Moderación ===
  if (command === "!ban") {
    if (!msg.member.permissions.has("BanMembers")) return msg.reply("❌ No tienes permiso.");
    const user = msg.mentions.users.first();
    if (!user) return msg.reply("❌ Menciona a alguien para banear.");
    const member = msg.guild.members.cache.get(user.id);
    member.ban().then(() => msg.reply(`🚫 ${user.tag} ha sido baneado.`));
  }

  if (command === "!kick") {
    if (!msg.member.permissions.has("KickMembers")) return msg.reply("❌ No tienes permiso.");
    const user = msg.mentions.users.first();
    if (!user) return msg.reply("❌ Menciona a alguien para expulsar.");
    const member = msg.guild.members.cache.get(user.id);
    member.kick().then(() => msg.reply(`👢 ${user.tag} ha sido expulsado.`));
  }

  // === Minecraft Integration ===
  if (command === "!mcinfo") {
    msg.reply("🎮 Servidor CandyCraft: play.candycraft.net\nVersión: 1.21");
  }

  if (command === "!players") {
    try {
      const res = await fetch("https://api.mcsrvstat.us/2/play.candycraft.net");
      const data = await res.json();
      msg.reply(`👥 Jugadores conectados: ${data.players.online}/${data.players.max}`);
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

// === Tickets ===
setupTickets(client);

// === Login ===
client.once("ready", () => {
  console.log(`✅ CandyBot conectado como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
