document.addEventListener("DOMContentLoaded", async () => {

  const questionsContainer = document.getElementById("questions-container");
  const answers = {};

  /* =========================
     1️⃣ SORULARI GETİR
  ========================== */
  try {
    const snapshot = await db.collection("questions").orderBy("createdAt", "asc").get();

    // Spinner'ı temizle
    questionsContainer.innerHTML = "";

    if (snapshot.empty) {
      questionsContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Henüz soru eklenmemiş.</p>";
    } else {
      snapshot.forEach(doc => {
        const q = doc.data();
        const div = document.createElement("div");
        div.className = "card";
        div.dataset.questionId = doc.id; // Firestore ID kullan

        div.innerHTML = `
          <h3>${q.text}</h3>
          <div class="buttons">
            <button class="positive">Olumlu</button>
            <button class="negative">Olumsuz</button>
          </div>
          <textarea placeholder="Açıklama (isteğe bağlı)"></textarea>
        `;
        questionsContainer.appendChild(div);
      });
    }

  } catch (error) {
    console.error("Soru yükleme hatası:", error);
    questionsContainer.innerHTML = "<p style='text-align:center; color:red; padding:20px;'>Sorular yüklenirken bir hata oluştu.</p>";
  }

  /* =========================
     2️⃣ CEVAPLARI DİNLE (Event Delegation)
  ========================== */
  questionsContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const btn = e.target;
      const card = btn.closest(".card");

      if (!card) return; // Güvenlik

      const questionId = card.dataset.questionId;

      // Aynı karttaki eski seçimleri temizle
      card.querySelectorAll("button").forEach(b => b.classList.remove("selected"));

      // Yeni seçimi işaretle
      btn.classList.add("selected");

      // Cevabı kaydet
      answers[questionId] = {
        cevap: btn.classList.contains("positive") ? "Olumlu" : "Olumsuz"
      };
    }
  });

  /* =========================
     3️⃣ ANKETİ GÖNDER
  ========================== */
  document.getElementById("submit").addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card");

    // Eğer hiç soru yoksa veya yüklenemediyse işlem yapma
    if (cards.length === 0) return;

    if (Object.keys(answers).length < cards.length) {
      alert("Lütfen tüm soruları cevaplayınız.");
      return;
    }

    const finalAnswers = {};
    cards.forEach(card => {
      const qid = card.dataset.questionId;
      // Cevabın varlığını kontrol et (yukarıdaki check zaten garanti ediyor ama double-check)
      if (answers[qid]) {
        finalAnswers[qid] = {
          cevap: answers[qid].cevap,
          yorum: card.querySelector("textarea").value.trim()
        };
      }
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

});
