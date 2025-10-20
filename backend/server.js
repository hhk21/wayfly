require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://wayfly.onrender.com' }));

// Dodawanie opinii
app.post('/api/add-review', async (req, res) => {
  try {
    const { email, rating, tripTo, tripStart, tripEnd, comment } = req.body;
    await db.collection('reviews').add({
      userEmail: email,
      rating,
      tripTo,
      tripStart,
      tripEnd,
      comment,
      approved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Pobieranie zatwierdzonych opinii
app.get('/api/reviews', async (req, res) => {
  try {
    const snapshot = await db.collection('reviews')
      .where('approved', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    const reviews = snapshot.docs.map(doc => doc.data());
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
