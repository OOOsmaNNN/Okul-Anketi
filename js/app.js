const cards = document.querySelectorAll(".card");
const resultsDiv = document.getElementById("results");

cards.forEach(card => {
  const buttons = card.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      card.dataset.answer = btn.textContent;
    });
  });
});

document.getElementById("submit").addEventListener("click", () => {
  resultsDiv.innerHTML = "";

  cards.forEach(card => {
    const question = card.dataset.question;
    const answer = card.dataset.answer || "Cevap verilmedi";
    const comment = card.querySelector("textarea").value;

    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <strong>${question}</strong><br>
      Cevap: ${answer}<br>
      Açıklama: ${comment || "-"}
    `;

    resultsDiv.appendChild(div);
  });
});
