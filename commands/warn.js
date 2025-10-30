// utils/moderation.js (Versión ESM corregida)
import fs from 'fs'; // CAMBIO 1
const logFile = './moderation_logs.json';

// Función para leer los registros actuales
function loadLogs() {
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, JSON.stringify({}));
        return {};
    }
    try {
        const data = fs.readFileSync(logFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar logs de moderación:', error);
        return {};
    }
}

// Función para guardar los logs
function saveLogs(logs) {
    try {
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al guardar logs de moderación:', error);
    }
}

// Función principal para añadir una sanción
function addSanction(userId, type, moderatorId, reason, duration = null) {
    const logs = loadLogs();
    
    // Inicializar el usuario si no existe
    if (!logs[userId]) {
        logs[userId] = {
            warnings: [],
            mutes: [],
            bans: [],
        };
    }

    const sanctionEntry = {
        type: type, // 'warn', 'mute', 'ban'
        moderatorId: moderatorId,
        reason: reason,
        timestamp: new Date().toISOString(),
        duration: duration // solo para mute/ban
    };

    // Añadir al array correspondiente
    if (logs[userId][type + 's']) {
        logs[userId][type + 's'].push(sanctionEntry);
    }

    saveLogs(logs);
    return logs[userId]; // Devolver el historial actualizado
}

// CAMBIO 2: Exportar funciones
export {
    loadLogs,
    addSanction
};
