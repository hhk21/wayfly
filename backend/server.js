import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Konfiguracja Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

// 🟢 Endpoint: Pobieranie opinii
app.get("/api/reviews", async (req, res) => {
  try {
    const snapshot = await db
      .collection("reviews")
      .where("approved", "==", true)
      .get();

    const reviews = snapshot.docs.map((doc) => doc.data());
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd pobierania opinii" });
  }
});

// 🟢 Endpoint: Dodawanie opinii
app.post("/api/add-review", async (req, res) => {
  try {
    const { name, email, rating, tripTo, tripStart, tripEnd, comment } = req.body;

    if (!name || !email || !rating || !tripTo || !tripStart || !tripEnd || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "Niepełne dane opinii" });
    }

    await db.collection("reviews").add({
      name,
      userEmail: email,
      rating,
      tripTo,
      tripStart,
      tripEnd,
      comment,
      approved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Opinia dodana i oczekuje zatwierdzenia" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Błąd dodawania opinii" });
  }
});

// 🟢 Endpoint: Składanie zamówienia
app.post("/api/order", async (req, res) => {
  try {
    const { trip, guests, remarks, email, date } = req.body;

    if (!trip || !guests || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Niepełne dane zamówienia" });
    }

    await db.collection("orders").add({
      trip,
      guests,
      remarks,
      email,
      date: date || new Date().toISOString(),
    });

    res.json({ success: true, message: "Zamówienie zapisane w bazie" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Błąd zapisu zamówienia" });
  }
});

// 🟢 Testowy endpoint
app.get("/", (req, res) => {
  res.send("✅ Wayfly backend działa!");
});

// 🟢 Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
