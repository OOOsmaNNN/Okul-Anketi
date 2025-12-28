const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "root",
  database: "anket_db"
});

db.connect(err => {
  if (err) {
    console.error("DB Hatası:", err);
  } else {
    console.log("MySQL bağlandı ✅");
  }
});

app.get("/", (req, res) => {
  res.send("Anket API çalışıyor ✅");
});

app.post("/cevap", (req, res) => {
  const { question_id, answer, comment } = req.body;

  db.query(
    "INSERT INTO responses (question_id, answer, comment) VALUES (?, ?, ?)",
    [question_id, answer, comment],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json({ success: true });
    }
  );
});

app.get("/cevaplar", (req, res) => {
  db.query("SELECT * FROM responses", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log("Server çalışıyor → 3000");
});
