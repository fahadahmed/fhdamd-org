import express from 'express';
import { encryptRouter } from './routes/encrypt';
import { decryptRouter } from './routes/decrypt';

const app = express();
const PORT = process.env.PORT ?? 8080;

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/encrypt', encryptRouter);
app.use('/decrypt', decryptRouter);

app.listen(PORT, () => {
  console.log(`pdf-processor running on port ${PORT}`);
});
