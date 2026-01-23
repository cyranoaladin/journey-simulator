const express = require('express');
const cors = require('cors');
const missionRoutes = require('./routes/missionRoutes');

// --- DEBUG HANDLERS (Pour comprendre le crash) ---
process.on('uncaughtException', (err) => {
    console.error('💥 CRASH NON GÉRÉ :', err);
});

process.on('exit', (code) => {
    console.log(`💀 Le processus s'arrête avec le code : ${code}`);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/missions', missionRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'ONLINE', version: 'S2.4-Debug' });
});

// Capture de la tentative de démarrage
try {
    const server = app.listen(PORT, () => {
        console.log(`\n🚀 Money Factory Backend is running on http://localhost:${PORT}`);
        console.log(`📡 Endpoint ready: POST http://localhost:${PORT}/api/missions/submit\n`);
    });
    
    // Empêcher le serveur de se fermer si une connexion échoue
    server.on('error', (e) => console.error('Erreur Serveur:', e));

} catch (e) {
    console.error('Erreur au lancement:', e);
}
