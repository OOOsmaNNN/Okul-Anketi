document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     1️⃣ CEVAP TOPLAMA
  ========================== */
  const answers = {};

  document.querySelectorAll(".card").forEach((card) => {
    const questionId = card.dataset.questionId;

    card.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {

        // Aynı karttaki eski seçimleri temizle
        card.querySelectorAll("button").forEach(b =>
          b.classList.remove("selected")
        );

        // Yeni seçimi işaretle
        btn.classList.add("selected");

        // Sadece olumlu / olumsuz bilgisini tut
        answers[questionId] = {
          cevap: btn.classList.contains("positive") ? "Olumlu" : "Olumsuz"
        };
      });
    });
  });

  /* =========================
     2️⃣ ANKETİ GÖNDER
  ========================== */
  document.getElementById("submit").addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card");

    if (Object.keys(answers).length < cards.length) {
      alert("Lütfen tüm soruları cevaplayınız.");
      return;
    }

    // Submit anında yorumları oku
    const finalAnswers = {};

    cards.forEach(card => {
      const qid = card.dataset.questionId;
      finalAnswers[qid] = {
        cevap: answers[qid].cevap,
        yorum: card.querySelector("textarea").value.trim()
      };
    });

    try {
      await db.collection("anketler").add({
        cevaplar: finalAnswers,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
      });

      document.getElementById("status").innerText =
        "✅ Anketiniz başarıyla kaydedildi. Teşekkür ederiz!";

      setTimeout(() => location.reload(), 2000);

    } catch (error) {
      console.error("Firestore Hatası:", error);
      alert("Bir hata oluştu, lütfen tekrar deneyiniz.");
    }
  });

  /* =========================
     3️⃣ ANKET SONUÇLARINI GÖSTER
  ========================== */
  db.collection("anketler")
    .orderBy("tarih", "desc")
    .limit(5)
    .onSnapshot((snapshot) => {

      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const cevaplar = data.cevaplar;

        let html = `
          <div style="
            border:1px solid #ddd;
            padding:12px;
            margin-bottom:12px;
            border-radius:8px;
            background:#fafafa;
          ">
            <strong>🕒 Tarih:</strong>
            ${data.tarih?.toDate().toLocaleString("tr-TR") || "-"}
            <ul style="margin-top:8px;">
        `;

        for (const [qid, cevap] of Object.entries(cevaplar)) {
          html += `
            <li style="margin-bottom:6px;">
              <strong>Soru ${qid}:</strong>
              <span style="color:${cevap.cevap === "Olumlu" ? "green" : "red"}">
                ${cevap.cevap}
              </span>
              ${cevap.yorum ? `<br>📝 ${cevap.yorum}` : ""}
            </li>
          `;
        }

        html += `</ul></div>`;
        resultsDiv.innerHTML += html;
      });
    });

});
