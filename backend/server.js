// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://wayfly.onrender.com' }));

app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.API_FIREDATABASE,
    authDomain: process.env.AUTHDOMINE_FIREDATABASE,
    projectId: process.env.PROJECTID_FIREDATABASE,
    storageBucket: process.env.STORAGEBUCKET_FIREDATABASE,
    messagingSenderId: process.env.MESSAGINGSENDERID_FIREDATABASE,
    appId: process.env.APIID_FIREDATABASE
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// --- Start serwera ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
