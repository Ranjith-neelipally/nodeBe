const getById = (id) => document.getElementById(id);
let token, userId; // Declare token and userId at a higher scope
const submitButton = getById("submit-button");
const form = getById("resetForm");
const password = getById("password");
const confirmPassword = getById("confirm-password");
const alertMessage = getById("alertMessage");
const validationRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]{8,}$/;

const displayMessage = (success, message = "") => {
  alertMessage.className = `alert ${
    success ? "alert-success" : "alert-danger"
  }`;
  alertMessage.textContent = message;
  alertMessage.classList.toggle("d-none", message === "");
};

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  userId = params.get("userId"); // Assign values to the higher scoped variables
  token = params.get("token");

  try {
    const response = await fetch("/auth/verify-reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({ token, userId }),
    });
    if (!response.ok) throw new Error("Failed to verify reset token");
  } catch (error) {
    displayMessage(false, error.message);
  }
});

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!password.value.trim()) {
    displayMessage(false, "Password cannot be empty");
    return;
  }

  if (!validationRegex.test(password.value)) {
    displayMessage(false, "Password is too simple!");
    return;
  }

  if (password.value !== confirmPassword.value) {
    displayMessage(false, "Passwords did not match");
    return;
  }

  submitButton.innerHTML = `<div class="spinner-border text-light" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;

  try {
    const res = await fetch("/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({ token, userId, password: password.value }),
    });

    if (!res.ok) throw new Error("Failed to update password");
    displayMessage(true, "Password successfully updated!");
  } catch (error) {
    displayMessage(false, error.message);
  } finally {
    submitButton.innerHTML = "Submit";
  }
};

form.addEventListener("submit", handleSubmit);
