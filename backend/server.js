// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// --- Ustawienia CORS ---
// Zamień na URL Twojej strony frontendowej
app.use(cors({ origin: 'https://wayfly.onrender.com' }));

// --- Rate limiting ---
app.use(rateLimit({
  windowMs: 60_000, // 1 minuta
  max: 30,           // maksymalnie 30 żądań na IP
  message: "Za dużo żądań, spróbuj później"
}));

// --- Endpoint API ---
// Tu frontend wysyła dane (np. opinie), backend przekazuje dalej do zewnętrznego API
app.post('/api/send', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Brak danych do wysłania' });

    // Wywołanie zewnętrznego API z ukrytym kluczem
    const response = await fetch('https://external-api.example.com/endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    const result = await response.json();
    res.json({ success: true, result });
  } catch (err) {
    console.error('Błąd backendu:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Start serwera ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
