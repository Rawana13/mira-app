require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const documentsRouter = require('./routes/documents');
const visitsRouter = require('./routes/visits');
const medicationsRouter = require('./routes/medications');
const recordsRouter = require('./routes/records');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/documents', documentsRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/records', recordsRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Serve React production build
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`\n✅ Mira is running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${ip}:${PORT}  ← open this on your phone\n`);
});
