import { setRouter } from "../router/router.js";

// Set Router
setRouter();

// Backend URL
const backendURL = "http://my-project.test";

// Logout function
export async function logout() {
  try {
    const response = await fetchWithAuth(`${backendURL}/api/logout`);
    if (response.ok) {
      localStorage.clear();
      successNotification("Logout Successful.");
      window.location.pathname = "/";
    } else {
      const json = await response.json();
      errorNotification(`Logout failed: ${json.message}`, 10);
    }
  } catch (error) {
    errorNotification("An error occurred during logout: " + error.message);
  }
}

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const errorJson = await response.json();
        throw new Error(errorJson.message || "An unknown error occurred.");
      } else {
        const errorText = await response.text(); // Fallback for non-JSON responses
        throw new Error(errorText || "An unknown error occurred.");
      }
    }

    return response; // Return the response if everything is OK
  } catch (error) {
    console.error("Error with fetch request:", error.message);
    throw error;
  }
}

// Success Notification
function successNotification(message, timeout = 5) {
  const notificationElement = document.getElementById("successNotification");
  if (!notificationElement) {
    console.error("Notification element not found.");
    return;
  }

  notificationElement.textContent = message;
  notificationElement.style.display = "block";

  setTimeout(() => {
    notificationElement.classList.add("show");
  }, 10);

  // Hide after timeout
  setTimeout(() => {
    notificationElement.classList.remove("show");
    setTimeout(() => {
      notificationElement.style.display = "none";
    }, 500);
  }, timeout * 1000);
}

// Error Notification
function errorNotification(message, timeout = 5) {
  const notificationElement = document.getElementById("errorNotification");
  if (!notificationElement) {
    console.error("Notification element not found.");
    return;
  }

  notificationElement.textContent = message;
  notificationElement.style.display = "block"; // Make sure it's visible

  setTimeout(() => {
    notificationElement.classList.add("show"); // Fade in
  }, 10);

  // Hide after timeout
  setTimeout(() => {
    notificationElement.classList.remove("show"); // Fade out
    setTimeout(() => {
      notificationElement.style.display = "none"; // Hide completely
    }, 500);
  }, timeout * 1000);
}

// Fetch user details and update side navigation
async function fetchUserDetails() {
  const token = localStorage.getItem("token");

  if (!token) {
    errorNotification("User is not authenticated.");
    return;
  }

  try {
    const response = await fetchWithAuth(`${backendURL}/api/user-details`, {
      method: "GET",
    });

    const userData = await response.json();

    if (response.ok) {
      console.log("User data fetched successfully:", userData); // Debug log
      updateSideNav(userData);
    } else {
      console.error("Error response from server:", userData); // Debug log
      errorNotification(userData.message || "An error occurred.", 10);
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    errorNotification("An error occurred while fetching user details.", 10);
  }
}

function updateSideNav(userData) {
  if (!userData) {
    console.error("No user data available.");
    return;
  }

  // Update the barangay address
  const barangayName = document.getElementById("barangay-name");
  if (barangayName && userData.barangay) {
    barangayName.innerHTML = `<strong>Brgy. ${userData.barangay}</strong>`;
  }

  // Update the user name (first name + last name)
  const userID = document.getElementById("user_logged");
  if (userID && userData.firstname && userData.lastname) {
    userID.textContent = `${userData.firstname} ${userData.lastname}`;
  }

  // Optionally update the profile image
  const userImage = document.querySelector("#layoutSidenav_nav img");
  if (userImage && userData.profile_picture) {
    userImage.src = userData.profile_picture;
  }
}

// Initialize user data
document.addEventListener("DOMContentLoaded", () => {
  fetchUserDetails();
});

export {
  backendURL,
  successNotification,
  errorNotification,
  fetchUserDetails,
  updateSideNav,
};
