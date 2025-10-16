import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { matchRouter } from './routes/match';
import { setupSocketHandlers } from './sockets/lobby';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.use('/match', matchRouter);

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

const PORT = Number(process.env.PORT) || 8080;
setupSocketHandlers(io);

server.listen(PORT, () => {
	console.log(`Backend listening on http://localhost:${PORT}`);
});
