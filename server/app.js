import express from 'express';
import cors from 'cors';
import doctorsRouter from './routes/doctors.js';
import appointmentsRouter from './routes/appointments.js';
import patientsRouter from './routes/patients.js';
import medicinesRouter from './routes/medicines.js';

import recordsRouter from './routes/records.js';
import remindersRouter from './routes/reminders.js';
import ordersRouter from './routes/orders.js';
import videoConsultationsRouter from './routes/video_consultations.js';
import emergenciesRouter from './routes/emergencies.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/medicines', medicinesRouter);
app.use('/api/records', recordsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/video-consultations', videoConsultationsRouter);
app.use('/api/emergencies', emergenciesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;
