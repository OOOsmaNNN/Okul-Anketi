document.addEventListener("DOMContentLoaded", () => {

  const auth = firebase.auth();
  const db = firebase.firestore();

  const loginBody = document.getElementById("login-body");
  const adminContent = document.getElementById("admin-content");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const exportBtn = document.getElementById("exportBtn");
  const resultsDiv = document.getElementById("results");

  // Question Management Elements
  const newQuestionText = document.getElementById("newQuestionText");
  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const questionsList = document.getElementById("questionsList");

  // 📥 EXCEL İNDİR
  exportBtn.addEventListener("click", async () => {
    const snapshot = await db.collection("anketler")
      .orderBy("tarih", "desc")
      .get();

    let csv = "Tarih,Soru ID,Cevap,Yorum\n";

    snapshot.forEach(doc => {
      const data = doc.data();
      const tarih = data.tarih?.toDate().toLocaleString("tr-TR");

      for (const [qid, cevap] of Object.entries(data.cevaplar)) {
        csv += `"${tarih}","${qid}","${cevap.cevap}","${cevap.yorum || ""}"\n`;
      }
    });

    downloadCSV(csv, "anket_sonuclari.csv");

    function downloadCSV(content, fileName) {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  });

  // 🔐 Giriş
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("E-posta ve şifre giriniz!");
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      alert("❌ Giriş başarısız: " + err.message);
    }
  });

  // 🚪 ÇIKIŞ
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
  });

  // 🔎 Auth durumu
  auth.onAuthStateChanged(user => {
    if (user) {
      loginBody.style.display = "none";
      adminContent.style.display = "block";

      logoutBtn.style.display = "inline-flex";
      exportBtn.style.display = "inline-flex";

      loadResults();
      loadQuestions(); // 🆕 Soruları yükle
    } else {
      loginBody.style.display = "flex";
      adminContent.style.display = "none";

      logoutBtn.style.display = "none";
      exportBtn.style.display = "none";

      resultsDiv.innerHTML = "";
    }
  });

  // ➕ SORU EKLEME
  addQuestionBtn.addEventListener("click", async () => {
    const text = newQuestionText.value.trim();
    if (!text) {
      alert("Lütfen bir soru metni giriniz.");
      return;
    }

    try {
      await db.collection("questions").add({
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      newQuestionText.value = "";
    } catch (error) {
      console.error("Hata:", error);
      alert("Soru eklenemedi.");
    }
  });

  // 📋 SORULARI LİSTELE
  let questionsUnsubscribe;

  function loadQuestions() {
    if (questionsUnsubscribe) questionsUnsubscribe();

    questionsUnsubscribe = db.collection("questions")
      .orderBy("createdAt", "asc")
      .onSnapshot(snapshot => {
        questionsList.innerHTML = "";

        snapshot.forEach(doc => {
          const q = doc.data();
          const div = document.createElement("div");

          // Inline styles for list item
          div.style.background = "#f8fafc";
          div.style.padding = "15px";
          div.style.borderRadius = "8px";
          div.style.display = "flex";
          div.style.justifyContent = "space-between";
          div.style.alignItems = "center";
          div.style.border = "1px solid #e2e8f0";

          div.innerHTML = `
            <span style="font-weight:500;">${q.text}</span>
            <button class="negative" onclick="deleteQuestion('${doc.id}')" style="flex:0 0 auto; width:auto; padding:8px 16px; margin:0;">
              🗑 Sil
            </button>
          `;
          questionsList.appendChild(div);
        });
      });
  }

  // 🗑 SORU SİLME (Global fonksiyon)
  window.deleteQuestion = async (id) => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      try {
        await db.collection("questions").doc(id).delete();
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Soru silinemedi.");
      }
    }
  };

  // 📊 Anketleri getir
  function loadResults() {
    db.collection("anketler")
      .orderBy("tarih", "desc")
      .onSnapshot(snapshot => {

        resultsDiv.innerHTML = "";

        if (snapshot.empty) {
          resultsDiv.innerHTML = "<p style='text-align:center;'>Henüz anket sonucu yok.</p>";
          return;
        }

        snapshot.forEach(doc => {
          const data = doc.data();
          const tarih = data.tarih?.toDate().toLocaleString("tr-TR") || "Bilinmiyor";

          let html = `
            <div class="card" style="margin-bottom: 20px;">
              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">
                🕒 ${tarih}
              </h3>
              <div style="display: grid; gap: 15px;">
          `;

          for (const [qid, cevap] of Object.entries(data.cevaplar)) {
            const isPositive = cevap.cevap === "Olumlu";

            html += `
              <div style="padding: 10px; background: #f8fafc; border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 5px;">Soru ${qid}</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="
                    background: ${isPositive ? '#dcfce7' : '#fee2e2'}; 
                    color: ${isPositive ? '#166534' : '#991b1b'};
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                  ">
                    ${cevap.cevap}
                  </span>
                  ${cevap.yorum ? `<span style="color: #64748b;">📝 ${cevap.yorum}</span>` : ""}
                </div>
              </div>
            `;
          }

          html += `</div></div>`;
          resultsDiv.innerHTML += html;
        });
      });
  }

});
