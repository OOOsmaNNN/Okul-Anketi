document.addEventListener("DOMContentLoaded", () => {
  const answers = {};

  // Kartlardaki butonlara tıklama olayı
  document.querySelectorAll(".card").forEach((card) => {
    const question = card.dataset.question;

    card.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Önceki seçimi temizle
        card.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
        // Yeni seçimi işaretle
        btn.classList.add("selected");

        // Cevabı kaydet
        const isPositive = btn.classList.contains("positive");
        answers[question] = isPositive ? "Olumlu" : "Olumsuz";
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

    // Her bir cevabı gönder
    for (const [question, answer] of Object.entries(answers)) {
      // İlgili kartı bulup açıklamasını alalım
      const card = Array.from(cards).find(c => c.dataset.question === question);
      const comment = card.querySelector("textarea").value;

      try {
        await fetch("/cevap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: question, // Basitlik için soru metnini ID olarak kullanıyoruz
            answer: answer,
            comment: comment
          })
        });
      } catch (err) {
        console.error("Hata:", err);
      }
    }

    alert("Anketiniz başarıyla gönderildi! Teşekkür ederiz.");
    window.location.reload();
  });
});
