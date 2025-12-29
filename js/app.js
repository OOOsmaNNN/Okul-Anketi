document.addEventListener("DOMContentLoaded", () => {
  const answers = {};

  // Buton seçimleri
  document.querySelectorAll(".card").forEach((card) => {
    const questionId = card.dataset.questionId;

    card.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Önceki seçimleri temizle
        card.querySelectorAll("button").forEach(b =>
          b.classList.remove("selected")
        );

        // Yeni seçimi işaretle
        btn.classList.add("selected");

        // SADECE cevabı kaydet (yorum yok!)
        answers[questionId] = {
          cevap: btn.classList.contains("positive") ? "Olumlu" : "Olumsuz"
        };
      });
    });
  });

  // Gönder
  document.getElementById("submit").addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card");

    if (Object.keys(answers).length < cards.length) {
      alert("Lütfen tüm soruları cevaplayınız.");
      return;
    }

    // 🔥 SUBMIT ANINDA YORUMLARI OKU
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
});
