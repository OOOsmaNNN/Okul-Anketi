document.addEventListener("DOMContentLoaded", () => {
  const answers = {};

  // Kartlardaki butonlar
  document.querySelectorAll(".card").forEach((card) => {
    const questionId = card.dataset.questionId;

    card.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Önceki seçimleri temizle
        card.querySelectorAll("button").forEach(b => b.classList.remove("selected"));

        // Yeni seçimi işaretle
        btn.classList.add("selected");

        // Cevabı kaydet
        answers[questionId] = {
          cevap: btn.classList.contains("positive") ? "Olumlu" : "Olumsuz",
          yorum: card.querySelector("textarea").value
        };
      });
    });
  });

  // Gönder butonu
  document.getElementById("submit").addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card");

    if (Object.keys(answers).length < cards.length) {
      alert("Lütfen tüm soruları cevaplayınız.");
      return;
    }

    try {
      await db.collection("anketler").add({
        cevaplar: answers,
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
