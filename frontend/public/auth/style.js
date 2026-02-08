function clearLoginFields() {
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}

function clearRegisterFields() {
  document.getElementById("regUsername").value = "";
  document.getElementById("regEmail").value = "";
  document.getElementById("regPassword").value = "";
}

const authWrapper = document.querySelector(".auth-wrapper");
const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

goRegister.addEventListener("click", (e) => {
  e.preventDefault();
  clearLoginFields();
  clearRegisterFields();
  authWrapper.classList.add("toggled");
});

goLogin.addEventListener("click", (e) => {
  e.preventDefault();
  clearRegisterFields();
  clearLoginFields();
  authWrapper.classList.remove("toggled");
});


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("Login successful");
  } else {
    alert(data.message);
  }
});

// REGISTER
document.getElementById("registerBtn").addEventListener("click", async () => {
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Registration successful");
    authWrapper.classList.remove("toggled");
  } else {
    alert(data.message);
  }
});
