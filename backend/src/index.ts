import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth';
import patientsRouter from './routes/patients';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);

const port = process.env.PORT || 4006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
