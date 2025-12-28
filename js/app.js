document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const submitBtn = document.getElementById("submit");
  const resultsDiv = document.getElementById("results");

  // Her karta tıklandığında cevap seçimi
  cards.forEach(card => {
    const positiveBtn = card.querySelector(".positive");
    const negativeBtn = card.querySelector(".negative");

    positiveBtn.addEventListener("click", () => {
      card.dataset.answer = "Olumlu";
      card.classList.add("selected-positive");
      card.classList.remove("selected-negative");
    });

    negativeBtn.addEventListener("click", () => {
      card.dataset.answer = "Olumsuz";
      card.classList.add("selected-negative");
      card.classList.remove("selected-positive");
    });
  });

  submitBtn.addEventListener("click", async () => {
    const surveyData = [];

    cards.forEach(card => {
      const question = card.dataset.question;
      const answer = card.dataset.answer || "Cevap yok";
      const comment = card.querySelector("textarea").value || "";
      surveyData.push({ question, answer, comment });
    });

    try {
      const response = await fetch("http://localhost:5000/anket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        resultsDiv.innerHTML = "<p>✅ Anket başarıyla gönderildi!</p>";
        // İsteğe bağlı: formu temizle
        cards.forEach(card => {
          card.dataset.answer = "";
          card.classList.remove("selected-positive", "selected-negative");
          card.querySelector("textarea").value = "";
        });
      } else {
        resultsDiv.innerHTML = "<p>❌ Anket gönderilirken hata oluştu.</p>";
      }
    } catch (error) {
      console.error(error);
      resultsDiv.innerHTML = "<p>❌ Sunucuya bağlanırken hata oluştu.</p>";
    }
  });
});
