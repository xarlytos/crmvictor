import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { configRouter } from './routes/config';
import { clientesRouter } from './routes/clientes';
import { vencimientosRouter } from './routes/vencimientos';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clientes', clientesRouter);
app.use('/api/vencimientos', vencimientosRouter);
app.use('/api/config', configRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Seguros API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

