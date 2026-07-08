import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth';
import financeRouter from './routes/finance';
import patientsRouter from './routes/patients';
import sessionsRouter from './routes/sessions';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/finance', financeRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/sessions', sessionsRouter);

export default app;
