const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Statik dosyaları (frontend) sun (bir üst dizin)
app.use(express.static(path.join(__dirname, '..')));

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "anket_db"
});

db.connect(err => {
  if (err) {
    console.error("DB Hatası:", err);
  } else {
    console.log("MySQL bağlandı ✅");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id VARCHAR(255),
        answer VARCHAR(50),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createTableQuery, (err) => {
      if (err) console.error("Tablo oluşturma hatası:", err);
      else console.log("Tablo hazır (veya zaten var) ✅");
    });
  }
});

// API Status Endpoint
app.get("/status", (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server çalışıyor → Port ${PORT}`);
});
