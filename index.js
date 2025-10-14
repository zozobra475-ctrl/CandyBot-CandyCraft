// CANDYBOT - Discord.js v14
import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } from "discord.js";
import { Player } from "discord-player";
import express from "express";
import fetch from "node-fetch";
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

// === Login ===
client.login(process.env.TOKEN);
import { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ CandyBot está conectado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
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
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.reply({ content: "❌ Ya tienes un ticket abierto.", ephemeral: true });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Cerrar Ticket ❌")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎟️ ¡Hola ${interaction.user}, el equipo de soporte estará contigo pronto!`,
      components: [closeButton]
    });

    await interaction.reply({ content: `✅ Ticket creado: ${channel}`, ephemeral: true });
  }

  // Botón para cerrar ticket
  if (interaction.customId === "close_ticket") {
    const channel = interaction.channel;
    await interaction.reply({ content: "🕓 Cerrando el ticket en 5 segundos...", ephemeral: true });
    setTimeout(() => channel.delete().catch(() => {}), 5000);
  }
});

client.login(process.env.TOKEN);
