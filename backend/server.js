require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs
} = require('firebase/firestore');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://wayfly.onrender.com' })); // Twój frontend

// Inicjalizacja Firebase po stronie backendu
const firebaseApp = initializeApp({
  apiKey: process.env.API_FIREDATABASE,
  authDomain: process.env.AUTHDOMINE_FIREDATABASE,
  projectId: process.env.PROJECTID_FIREDATABASE,
  storageBucket: process.env.STORAGEBUCKET_FIREDATABASE,
  messagingSenderId: process.env.MESSAGINGSENDERID_FIREDATABASE,
  appId: process.env.APIID_FIREDATABASE
});

const db = getFirestore(firebaseApp);

// Endpoint do pobierania konfiguracji Firebase (frontend jej potrzebuje)
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

// Endpoint do dodawania opinii
app.post('/api/add-review', async (req, res) => {
  try {
    const { email, rating, tripTo, tripStart, tripEnd, comment } = req.body;

    await addDoc(collection(db, 'reviews'), {
      userEmail: email,
      rating,
      tripTo,
      tripStart,
      tripEnd,
      comment,
      approved: false,
      createdAt: serverTimestamp()
    });

    res.json({ success: true, message: 'Opinia dodana!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});

// Endpoint do pobierania zatwierdzonych opinii
app.get('/api/reviews', async (req, res) => {
  try {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, where('approved', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const reviews = snapshot.docs.map(doc => doc.data());
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
