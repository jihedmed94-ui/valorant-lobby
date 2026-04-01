import http from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import lobbyRoutes from './routes/lobbies.js';
import teamRoutes from './routes/teams.js';
import tournamentRoutes from './routes/tournaments.js';
import { registerMatchmakingHandlers } from './sockets/matchmaking.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/lobbies', lobbyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments', tournamentRoutes);

registerMatchmakingHandlers(io);

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
