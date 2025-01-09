import {
  backendURL,
  successNotification,
  errorNotification,
} from "../utils/utils.js";

form_login.onsubmit = async (e) => {
  e.preventDefault();

  // Disable the login button and show a loading spinner
  const loginButton = document.querySelector("#form_login button");
  loginButton.disabled = true;
  loginButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span></span>`;

  const formData = new FormData(form_login);

  try {
    const response = await fetch(`${backendURL}/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const json = await response.json();
    console.log("Response JSON:", json);

    if (response.ok) {
      if (json.data && json.data.token && json.data.data) {
        const userData = json.data.data;
        const token = json.data.token;

        // Clear previous session data to avoid conflicts
        localStorage.clear();

        // Save token and role
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", userData.user_id);

        // Show success notification
        alert("Login successful. Redirecting to dashboard...");
        // Redirect to dashboard
        form_login.reset();
        window.location.replace("/dashboard.html");
      } else {
        alert("Login failed. Token or role not found.");
      }
    } else {
      // Handle specific HTTP response statuses
      switch (response.status) {
        case 401:
          alert(json.message || "Invalid username or password.");
          break;
        case 422:
          console.log("Validation Errors:", json);
          errorNotification(json.message || "Validation error occurred.");
          break;
        default:
          alert("An unexpected error occurred. Please try again.");
          break;
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    errorNotification("An error occurred. Please try again.");
  } finally {
    // Re-enable the login button
    loginButton.disabled = false;
    loginButton.innerHTML = `Login`;
  }
};
