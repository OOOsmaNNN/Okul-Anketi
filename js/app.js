document.addEventListener("DOMContentLoaded", () => {
  let selectedAnswer = null;

  function selectAnswer(ans) {
    selectedAnswer = ans;
    document.getElementById("status").innerText = "Seçilen: " + ans;
  }

  document.getElementById("btn-olumlu").onclick = () => selectAnswer("olumlu");
  document.getElementById("btn-olumsuz").onclick = () => selectAnswer("olumsuz");

  document.getElementById("btn-submit").onclick = async () => {
    if (!selectedAnswer) {
      alert("Lütfen bir seçenek seçin");
      return;
    }

    const comment = document.getElementById("comment").value;

    const res = await fetch("http://localhost:3000/cevap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question_id: 1,
        answer: selectedAnswer,
        comment: comment,
      }),
    });

    if (res.ok) {
      document.getElementById("status").innerText = "✅ Kaydedildi!";
    } else {
      document.getElementById("status").innerText = "❌ Hata!";
    }
  };
});
