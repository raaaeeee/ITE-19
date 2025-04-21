import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Fetch and display all categories and handle form submission on page load  
document.addEventListener("DOMContentLoaded", function () {
  const storeId = new URLSearchParams(window.location.search).get("id");

  if (!storeId) {
    errorNotification("Store ID is missing in the URL.");
    return;
  }

  getCategory(storeId); // Pass the store ID to fetch categories for this store
  updateSalesLink(storeId); // Update the sales link dynamically
  handleAddCategoryForm(storeId); // Initialize add category form submission
});

// Update the Sales link in the navbar with the storeId
function updateSalesLink(storeId) {
  const salesLink = document.querySelector('.nav-link[href="store_sales.html"]');
  if (salesLink) {
    salesLink.href = `store_sales.html?id=${storeId}`;
  }
}

// Fetch categories from the backend for a specific store
async function getCategory(storeId, query = "") {
  const productContainer = document.getElementById("parentContainer");
  if (!productContainer) {
    console.error("Parent container element not found.");
    return;
  }

  productContainer.innerHTML = `<div class="text-center">Loading categories...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/store/${storeId}/category${query ? `?search=${query}` : ''}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const parentType = await response.json();
      console.log("Fetched Categories:", parentType);

      if (parentType.length === 0) {
        productContainer.innerHTML = `<div class="text-center text-muted">No categories found.</div>`;
        return;
      }

      let cardHTML = `<div class="row">`;
      parentType.forEach((type) => {
        cardHTML += `
          <div class="col-12 col-md-3 mb-4">
            <div class="card product-card" style="width: 18rem;" data-id="${type.parent_type_id}" data-name="${type.name}">
              <div class="card-body" style="background-color: #054003">
                <h5 class="card-title mb-2" style="color: #dfe101;">${type.name}</h5>
              </div>
            </div>
          </div>`;
      });
      cardHTML += `</div>`;
      productContainer.innerHTML = cardHTML;

      // Attach click events to category cards
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          const categoryId = card.dataset.id;

          // Ensure the storeId is passed to the product type page
          window.location.href = `product_type.html?category_id=${categoryId}&store_id=${storeId}`;
        });
      });
    } else {
      errorNotification(`Failed to load categories: HTTP ${response.status}`);
      productContainer.innerHTML = `<div class="text-center text-black">No Categories to load.</div>`;
    }
  } catch (error) {
    errorNotification("An error occurred while fetching categories: " + error.message);
    productContainer.innerHTML = `<div class="text-center text-danger">Error loading categories.</div>`;
  }
}

function handleAddCategoryForm(storeId) {
  const addCategoryForm = document.getElementById("addCategoryForm");
  const submitButton = addCategoryForm
    ? addCategoryForm.querySelector('button[type="submit"]')
    : null;

  if (!addCategoryForm || !submitButton) {
    console.error("Form or submit button not found.");
    return;
  }

  addCategoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable the submit button and show a loading spinner
    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    // Prepare the form data
    const formData = new FormData(addCategoryForm);

    // Append the storeId explicitly to the FormData
    formData.append("store_id", storeId);

    try {
      const response = await fetch(`${backendURL}/api/parent_type`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // FormData will automatically set the content type to 'multipart/form-data'
      });

      if (response.ok) {
        successNotification("Category added successfully.");
        addCategoryForm.reset();

        // Hide the modal after the form is submitted successfully
        const modalElement = document.getElementById("addCategoryModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        // Refresh the category list
        await getCategory(storeId);
      } else if (response.status === 422) {
        const json = await response.json();
        const errorMessage =
          json.errors && typeof json.errors === "object"
            ? Object.values(json.errors).flat().join("\n")
            : json.message || "Validation error.";
        errorNotification(errorMessage);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unexpected error occurred.");
      }
    } catch (error) {
      errorNotification("An error occurred: " + error.message);
    } finally {
      // Re-enable the submit button and reset its content
      submitButton.disabled = false;
      submitButton.innerHTML = `Save Category`;
    }
  });
}
