const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const serviceAccount = require("./permissions.json");

// databaseURL sacarla del admin sdk
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
});

const app = express();
const db = admin.firestore();

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "function running",
  });
});

app.post("/books", (req, res) => {
  (async () => {
    const bookCreated = await db.collection("books").add({
      title: req.body.title,
      description: req.body.description,
      pricing: req.body.pricing,
      author: req.body.author,
    });

    return res.status(201).json({
      ok: true,
      id: bookCreated.id,
    });
  })();
});

app.get("/api/books", (req, res) => {
  (async () => {
    const books = [];
    const querySnapshot = await db.collection("books").get();
    querySnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return res.status(200).json({
      ok: true,
      books,
    });
  })();
});

app.get("/api/books/:id", (req, res) => {
  (async () => {
    let docRef = db.collection("books").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        ok: false,
        err: "No such document!",
      });
    }
    let book = { id: req.params.id, ...doc.data() };
    return res.status(200).json({
      ok: true,
      book,
    });
  })();
});

app.put("/api/books/:id", (req, res) => {
  (async () => {
    const docRef = db.collection("books").doc(req.params.id);

    const bookModified = await docRef.set({
      title: req.body.title,
      description: req.body.description,
      pricing: req.body.pricing,
      author: req.body.author,
    });

    return res.status(201).json({
      ok: true,
      book: bookModified,
    });
  })();
});

app.delete("/api/books/:id", (req, res) => {
  (async () => {
    await db.collection("books").doc(req.params.id).delete();

    return res.status(204).json({
      ok: true,
    });
  })();
});

exports.app = functions.https.onRequest(app);
