import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
const port = Number(process.env.PORT ?? 4000);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend VoipTupniquim está online.' });
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
