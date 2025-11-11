import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import payhereRoutes from './routes/Payhere.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payhere', payhereRoutes);

export default app;
