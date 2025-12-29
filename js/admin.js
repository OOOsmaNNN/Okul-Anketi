document.addEventListener("DOMContentLoaded", () => {

  const auth = firebase.auth();
  const db = firebase.firestore();

  const loginDiv = document.getElementById("login");
  const resultsDiv = document.getElementById("results");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const exportBtn = document.getElementById("exportBtn");
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
      alert("❌ Giriş başarısız");
    }
  });

  // 🚪 ÇIKIŞ
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
  });

  // 🔎 Auth durumu
  auth.onAuthStateChanged(user => {
    if (user) {
      loginDiv.style.display = "none";
      logoutBtn.style.display = "inline-block";
      loadResults();
    } else {
      loginDiv.style.display = "block";
      logoutBtn.style.display = "none";
      resultsDiv.innerHTML = "";
    }
  });

  // 📊 Anketleri getir
  function loadResults() {
    db.collection("anketler")
      .orderBy("tarih", "desc")
      .onSnapshot(snapshot => {

        resultsDiv.innerHTML = "";

        snapshot.forEach(doc => {
          const data = doc.data();

          let html = `
            <div style="border:1px solid #ccc;padding:10px;margin-bottom:10px">
              <strong>🕒</strong>
              ${data.tarih?.toDate().toLocaleString("tr-TR")}
              <ul>
          `;

          for (const [qid, cevap] of Object.entries(data.cevaplar)) {
            html += `
              <li>
                <strong>Soru ${qid}:</strong> ${cevap.cevap}
                ${cevap.yorum ? ` - 📝 ${cevap.yorum}` : ""}
              </li>
            `;
          }

          html += `</ul></div>`;
          resultsDiv.innerHTML += html;
        });
      });
  }

});
