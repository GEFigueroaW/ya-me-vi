document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  analyzeBtn.addEventListener("click", async () => {
    const gameType = document.getElementById("gameSelect").value;
    if (typeof fetchData === 'function') {
      const data = await fetchData(gameType);
      document.getElementById("analysisResults").innerText = JSON.stringify(data, null, 2);
    } else {
      console.error("fetchData no está definido.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    });
  });

  const inputContainer = document.getElementById("numberInputs");
  for (let i = 0; i < 6; i++) {
    const input = document.createElement("input");
    input.className = "input is-small";
    input.type = "number";
    input.min = 1;
    input.max = 56;
    input.placeholder = (i + 1).toString();
    inputContainer.appendChild(input);
  }

  document.getElementById("clearBtn").addEventListener("click", () => {
    const inputs = document.querySelectorAll("#numberInputs input");
    inputs.forEach(input => input.value = "");
    document.getElementById("combinationResult").innerHTML = "";
  });
});
