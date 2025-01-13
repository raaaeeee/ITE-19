import {
  backendURL,
  successNotification,
  errorNotification,
} from "../utils/utils.js";

document.getElementById("form_login").onsubmit = async (e) => {
  e.preventDefault();

  // Get login button and disable it
  const loginButton = document.getElementById("loginButton");
  loginButton.disabled = true;
  loginButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Logging in...</span>`;

  const formData = new FormData(e.target);

  try {
    const response = await fetch(`${backendURL}/api/vendor/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const json = await response.json();
    console.log("Response JSON:", json);

    if (response.ok) {
      if (json.data?.token && json.data?.data) {
        const { token, data: vendorData } = json.data;

        // Clear previous session data
        localStorage.clear();

        // Save token and vendor ID
        localStorage.setItem("token", token);
        localStorage.setItem("vendor_id", vendorData.vendor_id);

        // Show success notification and redirect
        successNotification("Login successful. Redirecting to dashboard...");
        e.target.reset();
        setTimeout(() => {
          window.location.replace("/vendor_dashboard.html");
        }, 1500);
      } else {
        errorNotification("Login failed. Token or vendor data not found.");
      }
    } else {
      // Handle specific HTTP response statuses
      switch (response.status) {
        case 401:
          errorNotification(json.message || "Invalid email or password.");
          break;
        case 422:
          console.error("Validation Errors:", json);
          errorNotification(json.message || "Validation error occurred.");
          break;
        default:
          errorNotification("An unexpected error occurred. Please try again.");
          break;
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    errorNotification("An error occurred. Please try again.");
  } finally {
    // Re-enable the login button
    loginButton.disabled = false;
    loginButton.innerHTML = "Login";
  }
};
