import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';
import { matchRouter } from './routes/match';
import { setupSocketHandlers } from './sockets/lobby';

const app = express();

// Configure CORS with allowed origins
// Allows all localhost/127.0.0.1 origins (any port) for local development
// In production, set ALLOWED_ORIGINS env var to your frontend URL(s) (comma-separated)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

const corsOriginCheck = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
	// Allow requests with no origin (like mobile apps, curl, or Postman)
	if (!origin) return callback(null, true);
	
	// Allow any localhost or 127.0.0.1 origin regardless of port
	try {
		const url = new URL(origin);
		if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
			return callback(null, true);
		}
	} catch {
		// Invalid URL, fall through to check against allowedOrigins
	}
	
	// Check if origin is in the allowed list (production origins)
	if (allowedOrigins.includes(origin)) {
		return callback(null, true);
	}
	
	// Reject all other origins
	callback(new Error('Not allowed by CORS'));
};

app.use(cors({
	origin: corsOriginCheck,
	credentials: true,
}));

app.use(express.json());
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.use('/match', matchRouter);

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: corsOriginCheck,
		credentials: true,
	},
});

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
setupSocketHandlers(io);

// Helper to get local network IP
function getNetworkAddress(): string | null {
	const nets = networkInterfaces();
	for (const name of Object.keys(nets)) {
		for (const net of nets[name] || []) {
			// Skip internal (loopback) and non-IPv4 addresses
			if (net.family === 'IPv4' && !net.internal) {
				return net.address;
			}
		}
	}
	return null;
}

server.listen(PORT, HOST, () => {
	console.log('\n🧀 Cheesse Backend Server\n');
	console.log(`  Local:   http://localhost:${PORT}`);
	
	const networkIP = getNetworkAddress();
	if (networkIP) {
		console.log(`  Network: http://${networkIP}:${PORT}`);
	}
	console.log('');
});
