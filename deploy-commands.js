import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Configura el mensaje de creación de tickets.")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("🚀 Registrando comandos...");
  await rest.put(Routes.applicationCommands("1338927611350351972"), { body: commands });
  console.log("✅ Comando /ticket-setup registrado correctamente");
} catch (err) {
  console.error(err);
}