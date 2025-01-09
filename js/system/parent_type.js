import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Fetch and display all categories on page load
document.addEventListener("DOMContentLoaded", function () {
  const storeId = new URLSearchParams(window.location.search).get("id");
  if (storeId) {
    getCategory(storeId); // Pass the store ID to fetch categories for this store
  } else {
    errorNotification("Store ID is missing in the URL.");
  }
});

// Fetch categories from the backend for a specific store
async function getCategory(storeId, query = "") {
  const productContainer = document.getElementById("parentContainer");
  productContainer.innerHTML = `<div class="text-center">Loading categories...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/store/${storeId}/category${
        query ? `?search=${query}` : ""
      }`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const parent_type = await response.json();
      console.log("Fetched Categories:", parent_type); // Log fetched categories

      if (parent_type.length === 0) {
        productContainer.innerHTML = `<div class="text-center text-muted">No categories found.</div>`;
        return;
      }

      let cardHTML = `<div class="row">`;
      parent_type.forEach((type) => {
        console.log(`Category ID: ${type.parent_type_id}, Name: ${type.name}`); // Log each category
        cardHTML += `
          <div class="col-12 col-md-3 mb-4">
            <div class="card product-card" style="width: 18rem;" data-id="${type.parent_type_id}" data-name="${type.name}">
              <div class="card-body" style="background-color: #013a30; ">
                <h5 class="card-title mb-2" style=" color: #dfe101;">${type.name}</h5>  <!-- Display category name here -->
              </div>
            </div>
          </div>`;
      });
      cardHTML += `</div>`;
      productContainer.innerHTML = cardHTML;

      // Attach click events to category cards
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          console.log(`Card clicked: ${card.dataset.name}`);
        });
      });
    } else {
      errorNotification(`No categories to load: HTTP Error ${response.status}`);
      productContainer.innerHTML = `<div class="text-center text-black">No categories to load.</div>`;
    }
  } catch (error) {
    errorNotification(
      "An error occurred while fetching categories: " + error.message
    );
    productContainer.innerHTML = `<div class="text-center text-danger">Error loading categories.</div>`;
  }
}

// Handle form submission for adding a new category
document.addEventListener("DOMContentLoaded", () => {
  const addCategoryForm = document.getElementById("addCategoryForm");
  const submitButton = addCategoryForm
    ? addCategoryForm.querySelector('button[type="submit"]')
    : null;

  if (!addCategoryForm) {
    console.error("Form with ID 'addCategoryForm' not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button not found in 'addCategoryForm'.");
    return;
  }

  addCategoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    const storeId = new URLSearchParams(window.location.search).get("id");

    const formData = new FormData(e.target);
    const categoryData = {};
    formData.forEach((value, key) => {
      categoryData[key] = value;
    });
    categoryData.store_id = storeId; // Add the store_id to the category data

    try {
      const response = await fetch(`${backendURL}/api/parent_type`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        successNotification("Category added successfully.");
        addCategoryForm.reset();

        const modalElement = document.getElementById("addCategoryModal");
        if (modalElement) {
          const modal =
            bootstrap.Modal.getInstance(modalElement) ||
            new bootstrap.Modal(modalElement);
          modal.hide();
        }

        await getCategory(storeId); // Refresh the categories for this store
      } else if (response.status === 422) {
        const json = await response.json();
        errorNotification(json.message || "Validation error.");
      } else {
        throw new Error(`Network response error: ${response.status}`);
      }
    } catch (error) {
      errorNotification("An error occurred: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `Save Category`;
    }
  });
});
