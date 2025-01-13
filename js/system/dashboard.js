import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Logout Button
const btn_logout = document.getElementById("btn_logout");
if (btn_logout) {
  btn_logout.addEventListener("click", logout);
}

// Fetch and display stores
async function getStores(query = "") {
  const storeContainer = document.getElementById("storeContainer");
  storeContainer.innerHTML = `<div class="text-center">Loading stores...</div>`;

  try {
    console.log("Fetching stores...");
    const response = await fetch(
      `${backendURL}/api/store${query ? `?search=${query}` : ""}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const stores = await response.json();

      if (stores.length === 0) {
        storeContainer.innerHTML = `<div class="text-center text-muted">No stores found.</div>`;
        return;
      }

      let cardHTML = "";
      stores.forEach((store) => {
        cardHTML += `
  <div class="col-12 col-md-3 mb-4">
    <a href="parent_type.html?id=${store.store_id}" class="card-link">
      <div class="card" style="width: 18rem; background-color: #013a30; color: #dfe101;" data-id="${store.id}">
        <div class="card-body">
          <h5 class="card-title mb-2">${store.store_name}</h5>
          <p class="card-text mb-2">${store.store_address}</p>
          <p class="card-text">${store.operating_hours}</p>
        </div>
      </div>
    </a>
  </div>`;
      });
      storeContainer.innerHTML = cardHTML;
    } else {
      errorNotification(`Failed to load stores: HTTP Error ${response.status}`);
      storeContainer.innerHTML = `<div class="text-center text-danger">Failed to load stores.</div>`;
    }
  } catch (error) {
    errorNotification(
      "An error occurred while fetching stores: " + error.message
    );
    storeContainer.innerHTML = `<div class="text-center text-danger">Error loading stores.</div>`;
  }
}

// Initial load of stores
getStores();

// Handle form submission for adding a new store
document.addEventListener("DOMContentLoaded", () => {
  const addStoreForm = document.getElementById("addStoreForm");
  const submitButton = addStoreForm
    ? addStoreForm.querySelector('button[type="submit"]')
    : null;

  // Make sure the form and submit button exist
  if (!addStoreForm) {
    console.error("Form with ID 'addStoreForm' not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button not found.");
    return;
  }

  addStoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    // Prepare the form data
    const formData = new FormData(e.target);
    const storeData = {};
    formData.forEach((value, key) => {
      storeData[key] = value;
    });

    try {
      const response = await fetch(`${backendURL}/api/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeData), // Use storeData here
      });

      if (response.ok) {
        alert("Store added successfully.");
        addStoreForm.reset();

        // Hide the modal after the form is submitted successfully
        const modalElement = document.getElementById("addStoreModal");
        const modal =
          bootstrap.Modal.getInstance(modalElement) ||
          new bootstrap.Modal(modalElement);
        modal.hide();

        await getStores(); // Refresh the stores list
      } else if (response.status === 422) {
        const json = await response.json();
        errorNotification(json.message || "Validation error.");
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      errorNotification("An error occurred: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `Save Store`;
    }
  });
});
