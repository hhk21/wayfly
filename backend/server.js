import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore(); // <--- dostęp do Firestore

// --- Endpoint do pobierania opinii ---
app.get('/api/reviews', async (req, res) => {
  try {
    const snapshot = await db.collection('reviews').where('approved', '==', true).get();
    const reviews = snapshot.docs.map(doc => doc.data());
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd pobierania opinii' });
  }
});

// --- Endpoint do dodawania opinii ---
app.post('/api/add-review', async (req, res) => {
  try {
    const { name, email, rating, tripTo, tripStart, tripEnd, comment } = req.body;

    if (!name || !email || !rating || !tripTo || !tripStart || !tripEnd || !comment) {
      return res.status(400).json({ success: false, message: 'Niepełne dane' });
    }

    await db.collection('reviews').add({
      name,                 // <-- dodane imię
      userEmail: email,
      rating,
      tripTo,
      tripStart,
      tripEnd,
      comment,
      approved: false,       // opinia wymaga zatwierdzenia
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd dodawania opinii' });
  }
});

app.get('/', (req, res) => {
  res.send('Server running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
