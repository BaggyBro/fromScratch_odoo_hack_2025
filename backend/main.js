import express from 'express';
import cors from 'cors';  // <-- import cors
import { PrismaClient } from '@prisma/client';
import router from './routes/routes.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Use CORS middleware allowing your frontend origin
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,   // if you plan to send cookies or auth headers, else optional
}));

app.use(express.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the GlobeTrotter backend!');
});

// Auth routes
app.use("/", router);

// Start the Express server and check DB connection
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to Prisma:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
