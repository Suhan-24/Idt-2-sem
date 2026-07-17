import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import app from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🏥 MedCare API Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Doctors: http://localhost:${PORT}/api/doctors`);
    console.log(`   Appointments: http://localhost:${PORT}/api/appointments\n`);
  });
}

export default app;
